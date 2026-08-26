import XCTest

final class ReleaseCandidateJourneyUITests: XCTestCase {
  private var app: XCUIApplication!

  override func setUpWithError() throws {
    continueAfterFailure = false
    app = XCUIApplication()
    app.launch()
  }

  func testFreshInstallSixtyMinuteJourneyAndRecovery() throws {
    enterOfflineModeIfNeeded()
    completeOnboarding()

    XCTAssertTrue(element("action-review-workout").waitForExistence(timeout: 20), "Home must expose the next canonical session for review")
    attachScreenshot("01-planned-home")
    app.swipeUp()
    attachScreenshot("01a-cardio-home")
    app.swipeDown()

    tap("tab-plan")
    XCTAssertTrue(app.staticTexts["Plan"].waitForExistence(timeout: 10))
    attachScreenshot("02-plan-overview")
    tap("action-plan-session-1")
    XCTAssertTrue(element("plan-workout-preview").waitForExistence(timeout: 10))
    for _ in 0..<4 where !element("plan-workout-preview").isHittable { app.swipeUp() }
    attachScreenshot("02-plan-preview")
    tap("tab-home")

    openNextWorkoutFromHome()
    unlockMockSubscriptionIfPresented()
    tap("train-start")
    XCTAssertTrue(element("train-confirm-calibration").waitForExistence(timeout: 15))
    attachScreenshot("03-calibration")
    calibrateCurrentExercise(load: "40")
    completeCurrentSet(exercise: 1, set: 1)
    exerciseRestControls()
    editFirstCompletedSet()
    attachScreenshot("04-active-logger")

    // Continue is intentionally a no-op.
    tap("train-actions")
    tap("train-actions-cancel")
    XCTAssertTrue(element("train-actions").waitForExistence(timeout: 5))

    // Pause and leave preserves the performed set and restores the tab shell.
    tap("train-actions")
    tap("train-pause-leave")
    XCTAssertTrue(element("tab-home").waitForExistence(timeout: 10))
    XCTAssertTrue(element("action-resume-workout").waitForExistence(timeout: 10))
    attachScreenshot("05-paused-home")
    tap("action-resume-workout")
    XCTAssertTrue(element("train-actions").waitForExistence(timeout: 10), "A valid persisted attempt must resume directly into the active logger")
    XCTAssertFalse(element("train-resume").exists, "A valid persisted attempt must not add a redundant resume confirmation")
    attachScreenshot("05a-resumed-train")

    // Discard requires confirmation; cancelling preserves the attempt.
    tap("train-actions")
    tap("train-request-discard")
    XCTAssertTrue(app.staticTexts["Discard active attempt?"].waitForExistence(timeout: 5))
    attachScreenshot("06-discard-confirmation")
    tap("train-discard-cancel")
    XCTAssertTrue(element("train-actions").waitForExistence(timeout: 5))

    // Physical failure reproduction: confirmation must still work while a
    // numeric set field owns the keyboard.
    let nextReps = element("train-reps-1-2")
    XCTAssertTrue(nextReps.waitForExistence(timeout: 5))
    replaceText("8", in: nextReps)
    XCTAssertTrue(app.keyboards.firstMatch.exists)
    tap("train-actions")
    tap("train-request-discard")
    tap("train-discard-confirm")
    XCTAssertTrue(element("action-review-workout").waitForExistence(timeout: 15), "Discard must make the immutable planned session available again")
    XCTAssertFalse(app.keyboards.firstMatch.exists, "Discard must dismiss the numeric keyboard and restore normal navigation")

    // Start a fresh attempt, record valid work, and complete exactly once.
    openNextWorkoutFromHome()
    tap("train-start")
    calibrateCurrentExerciseIfRequired(load: "40")
    completeCurrentSet(exercise: 1, set: 1)
    skipRestIfPresent()
    tap("train-actions")
    tap("train-request-finish-early")
    tap("train-finish-early-confirm")
    XCTAssertTrue(app.staticTexts["Workout complete"].waitForExistence(timeout: 15))
    attachScreenshot("07-completion-summary")
    tap("action-view-progress")
    XCTAssertTrue(element("tab-progress").waitForExistence(timeout: 10))
    XCTAssertTrue(app.staticTexts["1 workout completed"].waitForExistence(timeout: 10))
    XCTAssertFalse(app.staticTexts.matching(NSPredicate(format: "label CONTAINS[c] %@", "personal record")).firstMatch.exists)
    attachScreenshot("08-progress-one-workout")

    // Relaunch through production persistence and verify history and next work remain.
    app.terminate()
    app.launch()
    XCTAssertTrue(element("action-preview-next-workout").waitForExistence(timeout: 20), "Completed history must restore while the next immutable session remains previewable")
    XCTAssertTrue(app.staticTexts["Today’s workout is done"].exists)
    XCTAssertTrue(app.staticTexts.matching(NSPredicate(format: "label CONTAINS[c] %@", "1 of 5 sessions completed")).firstMatch.exists)

    verifyDurationSettings()
  }

  func testInjectedHistoricalFutureReconcilesWithoutChangingCompletedHistory() throws {
    enterOfflineModeIfNeeded()
    XCTAssertTrue(element("action-preview-next-workout").waitForExistence(timeout: 20), "Stale future work must reconstruct through the canonical owners")
    XCTAssertTrue(app.staticTexts["Today’s workout is done"].exists)
    XCTAssertTrue(app.staticTexts.matching(NSPredicate(format: "label CONTAINS[c] %@", "1 of 5 sessions completed")).firstMatch.exists)
    XCTAssertFalse(app.staticTexts["Training needs a safe refresh"].exists)
    attachScreenshot("10-reconciled-stale-future")
  }

  func testInjectedCorruptPlanFailsClosedWithCustomerSafeRecovery() throws {
    enterOfflineModeIfNeeded()
    XCTAssertTrue(app.staticTexts["Training needs a safe refresh"].waitForExistence(timeout: 20))
    XCTAssertTrue(app.staticTexts.matching(NSPredicate(format: "label CONTAINS[c] %@", "recorded workout history has not been changed")).firstMatch.exists)
    XCTAssertFalse(element("train-start").exists)
    attachScreenshot("11-recoverable-corrupt-plan")
  }

  func testInjectedIncompatibleAttemptFailsClosedWithoutNavigationTrap() throws {
    enterOfflineModeIfNeeded()
    XCTAssertTrue(app.staticTexts["Training needs a safe refresh"].waitForExistence(timeout: 20))
    XCTAssertTrue(app.staticTexts.matching(NSPredicate(format: "label CONTAINS[c] %@", "recorded work remains stored for recovery")).firstMatch.exists)
    XCTAssertFalse(element("train-start").exists)
    attachScreenshot("12-recoverable-incompatible-attempt")
  }

  func testInjectedCanonicalAntagonistSupersetIsExecutable() throws {
    // The generator certifies these deterministic slot positions in the
    // companion carrier artifact; the UI test does not select training policy.
    try assertInjectedCanonicalMethod(
      methodLabel: "Antagonist superset",
      methodSlotOrder: 2,
      screenshotPrefix: "13-antagonist-superset",
      expectedNextInstruction: "Move directly"
    )
  }

  func testInjectedCanonicalRestPauseIsExecutable() throws {
    try assertInjectedCanonicalMethod(
      methodLabel: "Rest-pause",
      methodSlotOrder: 4,
      screenshotPrefix: "14-rest-pause",
      expectedNextInstruction: "rest-pause round"
    )
  }

  private func assertInjectedCanonicalMethod(
    methodLabel: String,
    methodSlotOrder: Int,
    screenshotPrefix: String,
    expectedNextInstruction: String
  ) throws {
    enterOfflineModeIfNeeded()
    openNextWorkoutFromHome()
    unlockMockSubscriptionIfPresented()
    tap("train-start")
    XCTAssertTrue(element("train-exercise-1").waitForExistence(timeout: 15), "Train must finish starting before method execution advances")

    advanceToWorkingSet(exercise: methodSlotOrder, set: 1)
    tap("train-exercise-\(methodSlotOrder)")
    let methodText = app.staticTexts.matching(NSPredicate(format: "label CONTAINS[c] %@", methodLabel)).firstMatch
    XCTAssertTrue(methodText.waitForExistence(timeout: 15), "Train must project the immutable canonical \(methodLabel) prescription")
    attachScreenshot(screenshotPrefix)

    let complete = element("train-complete-\(methodSlotOrder)-1")
    XCTAssertTrue(complete.waitForExistence(timeout: 8), "The canonical method must expose an executable working-set control")
    XCTAssertTrue(complete.isEnabled, "The current canonical method set must be executable")
    complete.tap()
    XCTAssertTrue(app.staticTexts.matching(NSPredicate(format: "label CONTAINS[c] %@", expectedNextInstruction)).firstMatch.waitForExistence(timeout: 8))
    attachScreenshot("\(screenshotPrefix)-next-step")
  }

  private func advanceToWorkingSet(exercise targetExercise: Int, set targetSet: Int) {
    let target = element("train-complete-\(targetExercise)-\(targetSet)")
    for _ in 0..<80 {
      let targetTab = element("train-exercise-\(targetExercise)")
      if targetTab.exists { targetTab.tap() }
      if target.exists && target.isEnabled { return }
      var advanced = false
      for exercise in 1...12 {
        let tab = element("train-exercise-\(exercise)")
        if !tab.exists { continue }
        tab.tap()
        for set in 1...12 {
          let candidate = element("train-complete-\(exercise)-\(set)")
          if candidate.exists && candidate.isEnabled {
            candidate.tap()
            skipRestIfPresent()
            advanced = true
            break
          }
        }
        if advanced { break }
      }
      XCTAssertTrue(advanced, "No canonical working set could advance the method journey")
    }
    XCTFail("The canonical method working set did not become current")
  }

  private func enterOfflineModeIfNeeded() {
    let offline = element("action-continue-offline")
    if offline.waitForExistence(timeout: 10) { tap("action-continue-offline") }
  }

  private func openNextWorkoutFromHome() {
    XCTAssertTrue(element("action-review-workout").waitForExistence(timeout: 20), "Home must expose the next canonical session for review")
    tap("action-review-workout")
    if element("action-start-14-day-free-trial").waitForExistence(timeout: 5) {
      unlockMockSubscriptionIfPresented()
    }
    XCTAssertTrue(element("train-start").waitForExistence(timeout: 10), "The prescription preview must expose the explicit start action")
  }

  private func completeOnboarding() {
    XCTAssertTrue(element("option-build-muscle").waitForExistence(timeout: 15))
    tap("option-build-muscle")
    tap("action-continue")
    tap("option-continuous-development")
    tap("action-continue")
    tap("option-5")
    tap("option-60")
    tap("action-continue")
    tap("option-push-pull-legs")
    tap("action-continue")
    tap("option-intermediate")
    tap("action-continue")
    // At large Dynamic Type on the narrow device, the next step's lower
    // choices are clipped out of the accessibility tree until it is scrolled.
    app.swipeUp()
    tap("option-currently-training")
    tap("recent-routine-5")
    tap("option-moderate")
    tap("option-ordinary")
    tap("option-none")
    tap("action-continue")
    let recommendedRecovery = element("option-recommended")
    XCTAssertTrue(recommendedRecovery.waitForExistence(timeout: 5))
    XCTAssertTrue(recommendedRecovery.isSelected, "Recommended recovery and cardio must remain the selected canonical default")
    tap("action-continue")
    XCTAssertTrue(element("onboarding-create-programme").waitForExistence(timeout: 5))
    XCTAssertTrue(app.staticTexts.matching(NSPredicate(format: "label CONTAINS[c] %@", "60 minutes")).firstMatch.waitForExistence(timeout: 5))
    attachScreenshot("00-onboarding-review")
    tap("onboarding-create-programme")
  }

  private func unlockMockSubscriptionIfPresented() {
    guard element("action-start-14-day-free-trial").waitForExistence(timeout: 5) else { return }
    element("action-start-14-day-free-trial").firstMatch.tap()
    let purchase = app.buttons["Start 14-Day Free Trial with Annual"]
    XCTAssertTrue(purchase.waitForExistence(timeout: 10))
    purchase.tap()
    XCTAssertTrue(app.staticTexts["Premium is active"].waitForExistence(timeout: 10))
    tap("action-continue-to-app")
    XCTAssertTrue(element("train-start").waitForExistence(timeout: 10))
  }

  private func calibrateCurrentExercise(load: String) {
    let loadField = element("train-calibration-load")
    XCTAssertTrue(loadField.waitForExistence(timeout: 8))
    replaceText(load, in: loadField)
    XCTAssertEqual(loadField.value as? String, load, "Calibration input must contain the complete deterministic test load")
    attachScreenshot("03a-calibration-keyboard-open")
    dismissTrainKeyboard()
    tap("train-confirm-calibration")
  }

  private func calibrateCurrentExerciseIfRequired(load: String) {
    let establishedLoad = element("train-load-1-1")
    XCTAssertTrue(establishedLoad.waitForExistence(timeout: 8), "A fresh attempt must expose either calibration or the retained factual starting load")
    if establishedLoad.value as? String == load { return }
    XCTAssertTrue(element("train-calibration-load").waitForExistence(timeout: 3), "A blank starting load must remain calibratable")
    calibrateCurrentExercise(load: load)
  }

  private func completeCurrentSet(exercise: Int, set: Int) {
    let complete = element("train-complete-\(exercise)-\(set)")
    XCTAssertTrue(complete.waitForExistence(timeout: 8))
    complete.tap()
  }

  private func exerciseRestControls() {
    XCTAssertTrue(element("action-pause-rest-timer").waitForExistence(timeout: 8))
    tap("action-pause-rest-timer")
    tap("action-resume-rest-timer")
    tap("action-30s-rest-timer")
    attachScreenshot("03b-rest-timer")
    tap("action-skip-rest-timer")
  }

  private func skipRestIfPresent() {
    if element("action-skip-rest-timer").waitForExistence(timeout: 3) { tap("action-skip-rest-timer") }
  }

  private func editFirstCompletedSet() {
    tap("train-all-sets-toggle")
    let edit = app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "Edit completed set 1")).firstMatch
    XCTAssertTrue(edit.waitForExistence(timeout: 5))
    edit.tap()
    let reps = element("train-reps-1-1")
    XCTAssertTrue(reps.waitForExistence(timeout: 5))
    replaceText("9", in: reps)
    dismissTrainKeyboard()
    let save = app.buttons.matching(NSPredicate(format: "label == %@", "Save edits to set 1")).firstMatch
    XCTAssertTrue(save.waitForExistence(timeout: 5))
    save.tap()
  }

  private func verifyDurationSettings() {
    tap("action-open-settings")
    XCTAssertTrue(element("settings-duration-60").waitForExistence(timeout: 10))
    XCTAssertTrue(element("settings-duration-60").isSelected)
    tap("settings-duration-90")
    XCTAssertTrue(app.staticTexts["Future workouts were rebuilt. Completed training was preserved."].waitForExistence(timeout: 10))
    XCTAssertTrue(element("settings-duration-90").isSelected)
    tap("settings-duration-75")
    XCTAssertTrue(app.staticTexts["Future workouts were rebuilt. Completed training was preserved."].waitForExistence(timeout: 10))
    XCTAssertTrue(element("settings-duration-75").isSelected)
    tap("settings-duration-60")
    XCTAssertTrue(app.staticTexts["Future workouts were rebuilt. Completed training was preserved."].waitForExistence(timeout: 10))
    XCTAssertTrue(element("settings-duration-60").isSelected)
    tap("settings-duration-45")
    assertInfeasibleDurationPreservesSixtyMinutes()
    tap("settings-duration-30")
    assertInfeasibleDurationPreservesSixtyMinutes()
    attachScreenshot("09-settings-duration")
  }

  private func assertInfeasibleDurationPreservesSixtyMinutes() {
    let guidance = app.staticTexts.matching(NSPredicate(
      format: "label CONTAINS[c] %@ AND label CONTAINS[c] %@",
      "cannot preserve the required training coverage",
      "longer workout or fewer training constraints"
    )).firstMatch
    XCTAssertTrue(guidance.waitForExistence(timeout: 10), "An infeasible duration must explain the coverage conflict and offer a compatible choice")
    XCTAssertTrue(element("settings-duration-60").isSelected, "An infeasible duration must not silently mutate the existing preference")
  }

  private func tap(_ identifier: String, timeout: TimeInterval = 10) {
    let target = element(identifier)
    XCTAssertTrue(target.waitForExistence(timeout: timeout), "Missing UI element: \(identifier)")
    let tappableViewport = app.frame.insetBy(dx: 4, dy: 4)
    for _ in 0..<12 {
      let activationPoint = CGPoint(x: target.frame.midX, y: target.frame.midY)
      if target.isHittable && tappableViewport.contains(activationPoint) { break }
      if activationPoint.y < tappableViewport.midY { app.swipeDown() }
      else { app.swipeUp() }
    }
    XCTAssertTrue(target.isHittable, "UI element is not hittable: \(identifier)")
    let visibleFrame = target.frame.intersection(tappableViewport)
    if !visibleFrame.isNull && visibleFrame.contains(CGPoint(x: target.frame.midX, y: target.frame.midY)) {
      target.tap()
    } else {
      XCTAssertFalse(visibleFrame.isNull || visibleFrame.isEmpty, "UI element has no visible tappable area: \(identifier)")
      let point = CGPoint(x: visibleFrame.midX, y: visibleFrame.midY)
      target.coordinate(withNormalizedOffset: CGVector(
        dx: (point.x - target.frame.minX) / target.frame.width,
        dy: (point.y - target.frame.minY) / target.frame.height
      )).tap()
    }
  }

  private func dismissTrainKeyboard() {
    guard app.keyboards.firstMatch.exists else { return }
    let done = element("train-keyboard-done")
    if done.exists && done.isHittable { done.tap() }
    else {
      app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.14)).tap()
      if app.keyboards.firstMatch.exists { app.swipeDown() }
    }
    let keyboard = app.keyboards.firstMatch
    let keyboardGone = XCTNSPredicateExpectation(predicate: NSPredicate(format: "hittable == false"), object: keyboard)
    let result = XCTWaiter.wait(for: [keyboardGone], timeout: 3)
    let noVisibleIntersection = !keyboard.exists || keyboard.frame.isEmpty || !keyboard.frame.intersects(app.frame)
    XCTAssertTrue(result == .completed || noVisibleIntersection, "Keyboard must not obscure the next workout action")
  }

  private func element(_ identifier: String) -> XCUIElement {
    app.descendants(matching: .any)[identifier]
  }

  private func replaceText(_ expected: String, in field: XCUIElement) {
    field.tap()
    let currentLength = (field.value as? String)?.count ?? 0
    field.typeText(String(repeating: XCUIKeyboardKey.delete.rawValue, count: max(currentLength, 1)))
    for character in expected {
      field.typeText(String(character))
      Thread.sleep(forTimeInterval: 0.1)
    }
  }

  private func attachScreenshot(_ name: String) {
    let attachment = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
    attachment.name = name
    attachment.lifetime = .keepAlways
    add(attachment)
  }
}

private extension XCUIElement {
  func tapIfExists() {
    if exists && isHittable { tap() }
  }
}
