# Angular Preset and Deep Interactive Interview Specification

## ADDED Requirements

### Requirement: Angular Architecture Preset Definition
Architecture Guard MUST provide a dedicated built-in architecture preset for Angular (`presets/angular.md` and `src/presets/angular.md`) that defines modern Angular conventions, boundary mappings, detection rules, anti-patterns, and an init interview.

#### Scenario: Reviewing Angular application boundaries
- **GIVEN** a project configured with the Angular preset
- **WHEN** Architecture Guard performs an architecture review or violation detection
- **THEN** it maps generic boundaries to Angular primitives (Pages/Routes, Typed Reactive Forms, DTO contracts, Injectable Services/Signals, Domain Entities, HttpClient/Data Services, Standalone UI Components).

#### Scenario: Detecting Angular anti-patterns
- **GIVEN** an Angular project
- **WHEN** components contain unmanaged RxJS subscriptions, direct `HttpClient` invocations, or business logic mixed into templates
- **THEN** Architecture Guard flags these as architectural violations according to the Angular preset detection rules.

### Requirement: Deep Interactive Interview for Angular Flow and Rules
The Angular preset and `init` command MUST include sequential interview questions and deep flow inquiries covering critical Angular architecture concerns.

#### Scenario: Running init interview with Angular preset
- **GIVEN** the user selects the Angular preset during `/ag-init`
- **WHEN** the preset interview runs
- **THEN** it inquires about component style (Standalone vs NgModules), reactivity & state ownership (Signals vs RxJS vs NgRx/Signals Store), dependency injection (`inject()` vs constructor), change detection (`OnPush` vs Default), HTTP/Data boundaries, and conducts an interactive check on deep Angular concerns (SSR/@defer, Signals-RxJS interop, micro-frontends, `@angular-eslint`).

### Requirement: Global Preset Discovery and Constitution Updates
The Angular preset MUST be registered in `src/docs/presets.md`, `src/templates/architecture_constitution.md`, `src/commands/init.md`, and `src/orchestration/init.md`, and synchronized to `.architecture-guard/presets/`.

#### Scenario: Discovering available presets
- **GIVEN** an engineering team initializing Architecture Guard
- **WHEN** available presets are listed in documentation or during init prompt
- **THEN** Angular is listed as a supported framework preset.
