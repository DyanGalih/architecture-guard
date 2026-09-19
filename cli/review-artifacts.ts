export function runReviewArtifacts(_opts: unknown) {
  console.log([
    "# Architecture Artifact Review",
    "",
    "- **Status**: Unavailable",
    "- **Reason**: The Architecture Guard CLI does not execute agent-native review prompts or host review capabilities.",
    "- **Repository changes**: None",
    "- **Next step**: Run the installed `ag-review-artifacts` skill or command, or perform the documented manual review and report its evidence.",
  ].join("\n"));
}
