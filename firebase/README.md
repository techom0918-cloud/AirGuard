# AirGuard Firebase Configuration & Security Rules

This directory contains configuration files and Firestore security rules for AirGuard's Cloud Firestore instance.

## Files

- `firebase.json`: Primary Firebase project configuration mapping Firestore rules.
- `firestore.rules`: Security rules for Firestore collections (`devices`, `readings`, `alerts`).

> **Warning:** The default `firestore.rules` file is configured for development/testing only and permits open read/write access. Ensure rules are hardened prior to production deployment.
