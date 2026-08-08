## MODIFIED Requirements

### Requirement: Strict Specify CLI Compatibility
All commands and hooks exported by the extension MUST strictly adhere to the `speckit.{extension_id}.{command}` format required by Specify's CLI.

#### Scenario: Installing the extension
- **WHEN** a user installs the extension via `specify extension add architecture-guard`
- **THEN** no compatibility warnings are thrown about invalid command name patterns
- **THEN** all commands correctly register under the `speckit.architecture-guard.*` namespace
