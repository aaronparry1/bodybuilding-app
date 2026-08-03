function readVerificationToken() {
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  const token = fragment.get("access_token");
  const error = fragment.get("error_description") || fragment.get("error");
  window.history.replaceState(null, document.title, window.location.pathname);
  return { token, error };
}

function setupAccountDeletionVerification() {
  const root = document.querySelector("[data-deletion-verification]");
  if (!root) return;
  const pending = root.querySelector("[data-verification-pending]");
  const confirm = root.querySelector("[data-verification-confirm]");
  const button = root.querySelector("[data-confirm-deletion]");
  const result = root.querySelector("[data-verification-result]");
  const verification = readVerificationToken();
  let accessToken = verification.token;

  const showResult = (title, message, receipt) => {
    pending.hidden = true;
    confirm.hidden = true;
    result.hidden = false;
    result.innerHTML = "";
    const heading = document.createElement("h2");
    heading.textContent = title;
    const body = document.createElement("p");
    body.textContent = message;
    result.append(heading, body);
    if (receipt) {
      const receiptText = document.createElement("p");
      receiptText.className = "receipt";
      receiptText.textContent = `Receipt: ${receipt}`;
      result.append(receiptText);
    }
  };

  if (verification.error || !accessToken) {
    showResult("Link invalid or expired", "Request a new secure deletion link. No account was changed.");
    return;
  }

  pending.hidden = true;
  confirm.hidden = false;
  button.addEventListener("click", async () => {
    button.disabled = true;
    button.textContent = "Deleting…";
    try {
      const response = await fetch("/api/delete-account/confirm", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: "{}",
      });
      const payload = await response.json();
      accessToken = null;
      if (!response.ok) {
        showResult("Deletion not completed", payload.message || "The account was not confirmed as deleted. Request a new link or contact support.");
        return;
      }
      showResult(payload.status === "already_deleted" ? "Already deleted" : "Account deleted", payload.message, payload.receipt);
    } catch {
      showResult("Deletion not completed", "The service could not confirm deletion. Request a new link or contact support. Do not assume the account is deleted without a completion receipt.");
    }
  });
}

setupAccountDeletionVerification();
