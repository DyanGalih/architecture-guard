---
description: Apply CodeIgniter-specific architecture conventions during initialization and architecture review.
---

# Architecture Guard — CodeIgniter Adapter

## Naming Standards

If the user selects Standard/General naming conventions during initialization, apply these CodeIgniter-native defaults based on their version (ask if not already known):

**CodeIgniter 4 (PSR-4 Compliant)**
- **Classes** (Controllers, Models, Entities): `PascalCase` (e.g., `UserModel`, `ProductController`)
- **Properties and Variables**: `camelCase`
- **Methods**: `camelCase`
- **Database Tables**: `snake_case` (plural)
- **Database Columns**: `snake_case`
- **File Names**: `PascalCase.php` (matching the exact class name, e.g., `UserModel.php`)

**CodeIgniter 3 (Legacy)**
- **Controllers**: `PascalCase` with `_Controller` suffix or just `PascalCase`
- **Models**: `PascalCase` with `_model` suffix (e.g., `User_model`)
- **Properties and Variables**: `snake_case`
- **Methods**: `snake_case`
- **Database Tables**: `snake_case` (plural)
- **Database Columns**: `snake_case`
- **File Names**: `PascalCase.php` (e.g., `User_model.php`)

## Init Interview

Ask these questions sequentially after the CodeIgniter preset is selected.

### Application Style

Ask:

```text
What application style are you using?

- MVC (Views rendered by CI)
- REST API
- Hybrid
```
