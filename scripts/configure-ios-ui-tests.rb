#!/usr/bin/env ruby
# frozen_string_literal: true

require "xcodeproj"

project_path = File.expand_path("../ios/AdaptiveStrengthCoach.xcodeproj", __dir__)
project = Xcodeproj::Project.open(project_path)
app_target = project.targets.find { |target| target.name == "AdaptiveStrengthCoach" }
abort "AdaptiveStrengthCoach target not found" unless app_target

test_target = project.targets.find { |target| target.name == "AdaptiveStrengthCoachUITests" }
unless test_target
  test_target = project.new_target(:ui_test_bundle, "AdaptiveStrengthCoachUITests", :ios, "16.4")
  test_target.add_dependency(app_target)
end

group = project.main_group.find_subpath("AdaptiveStrengthCoachUITests", true)
group.set_source_tree("<group>")
group.set_path("AdaptiveStrengthCoachUITests")
file = group.files.find { |candidate| candidate.path == "ReleaseCandidateJourneyUITests.swift" } || group.new_file("ReleaseCandidateJourneyUITests.swift")
test_target.source_build_phase.add_file_reference(file, true) unless test_target.source_build_phase.files_references.include?(file)

test_target.build_configurations.each do |configuration|
  configuration.build_settings["PRODUCT_BUNDLE_IDENTIFIER"] = "com.aaronparry.adaptivestrengthcoach.uitests"
  configuration.build_settings["PRODUCT_NAME"] = "$(TARGET_NAME)"
  configuration.build_settings["PRODUCT_MODULE_NAME"] = "$(TARGET_NAME:c99extidentifier)"
  configuration.build_settings["GENERATE_INFOPLIST_FILE"] = "YES"
  configuration.build_settings["TEST_TARGET_NAME"] = "AdaptiveStrengthCoach"
  configuration.build_settings["SWIFT_VERSION"] = "5.0"
  configuration.build_settings["TARGETED_DEVICE_FAMILY"] = "1"
  configuration.build_settings["IPHONEOS_DEPLOYMENT_TARGET"] = "16.4"
end

project.save

scheme = Xcodeproj::XCScheme.new
scheme.add_build_target(app_target)
scheme.add_build_target(test_target)
scheme.add_test_target(test_target)
scheme.set_launch_target(app_target)
scheme.test_action.build_configuration = "Release"
scheme.launch_action.build_configuration = "Release"
scheme.profile_action.build_configuration = "Release"
scheme.analyze_action.build_configuration = "Release"
scheme.archive_action.build_configuration = "Release"
scheme.save_as(project_path, "AdaptiveStrengthCoachReleaseCandidate", true)
