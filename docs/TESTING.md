# Field Test Matrix

Before publishing a release broadly, test the integration on a non-critical lighting circuit and verify each scenario below.

| Scenario | Expected result |
| --- | --- |
| Output OFF → ON physically | Group becomes ON and reflective controllers synchronize ON |
| Output ON → OFF physically | Group becomes OFF and reflective controllers synchronize OFF |
| Mirror controller changes | Output confirms first, then followers synchronize |
| Toggle controller changes | Confirmed group state toggles once only |
| Momentary controller pulse | One pulse produces one logical toggle |
| Button/input_button/event controller | Every real event produces one toggle, with no reflection command |
| Controller becomes unavailable | Load is not changed; group health degrades |
| Controller returns | Controller is reconciled; return state is not treated as a press |
| Output becomes unavailable | Group reports output offline and does not invent a new state |
| Output returns with `adopt` | Returned physical state becomes authoritative |
| Output returns with `enforce` | Last desired state is requested after recovery |
| Delayed state confirmation | Transaction waits within configured timeout |
| Failed output command | Desired state is not falsely committed; failure is logged/diagnosed |
| Rapid alternating presses | Per-group lock/debounce prevents feedback loops/races |
| Home Assistant restart | Startup protection prevents false toggles during entity restoration |
| Deleted source entity | Health/Repairs identifies the missing entity |
| Sync Now | Followers reconcile to the confirmed output/desired state |
| Disable group | Synchronization stops without deleting configuration |
| JSON export/import | Configuration restores without entity overlap or silent data loss |
| Integration removal | Persistent integration storage and its Repair issues are removed |

Also validate the repository Actions (HACS, Hassfest, Ruff, Pytest) on every release candidate.
