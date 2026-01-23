# Wizard of Wor - Android Game

Ein Android-Spiel inspiriert vom klassischen Arcade-Spiel "Wizard of Wor" (1981).

## Spielbeschreibung

Navigiere durch das Labyrinth und besiege alle Monster, bevor sie dich erwischen! Das Spiel enthält verschiedene Gegnertypen mit unterschiedlichen Verhaltensweisen:

- **Burwor** (Rot): Langsam und einfach - 100 Punkte
- **Garwor** (Cyan): Mittlere Geschwindigkeit, kann unsichtbar werden - 200 Punkte
- **Thorwor** (Magenta): Schnell und aggressiv, kann unsichtbar werden - 500 Punkte
- **Worluk** (Grün): Sehr schnell, versucht zu fliehen - 1000 Punkte
- **Wizard** (Weiß): Der Boss, erscheint am Ende jedes Levels - 2500 Punkte

## Features

- 5 verschiedene Labyrinth-Layouts die sich alle 5 Level wiederholen
- Touch-Steuerung mit D-Pad und Feuer-Button
- Teleport-Türen an den Seiten des Labyrinths
- Steigende Schwierigkeit mit jedem Level
- Punktesystem mit High-Score-Tracking

## Steuerung

- **D-Pad** (links): Bewegung in alle Richtungen
- **FIRE Button** (rechts): Schießen in Blickrichtung

## APK Bauen

### Voraussetzungen

- Java JDK 17 oder höher
- Android SDK (API Level 34)
- Gradle 8.2+

### Mit Android Studio

1. Öffne das Projekt in Android Studio
2. Warte bis Gradle synchronisiert ist
3. Wähle `Build > Build Bundle(s) / APK(s) > Build APK(s)`
4. Die APK findest du unter `app/build/outputs/apk/debug/`

### Mit Kommandozeile

```bash
# ANDROID_HOME setzen (falls nicht bereits gesetzt)
export ANDROID_HOME=/path/to/android/sdk

# Debug APK bauen
./gradlew assembleDebug

# Release APK bauen (erfordert Signatur)
./gradlew assembleRelease
```

Die fertige APK findest du unter:
- Debug: `app/build/outputs/apk/debug/app-debug.apk`
- Release: `app/build/outputs/apk/release/app-release.apk`

## Projektstruktur

```
├── app/
│   ├── src/main/
│   │   ├── java/com/wizardofwor/game/
│   │   │   ├── MainActivity.kt      # Hauptaktivität
│   │   │   ├── GameView.kt          # Spielansicht und Rendering
│   │   │   ├── GameEngine.kt        # Spiellogik
│   │   │   ├── Maze.kt              # Labyrinth-Generierung
│   │   │   ├── Entity.kt            # Basis-Entitäten
│   │   │   └── Enemy.kt             # Gegner-KI
│   │   ├── res/
│   │   │   ├── drawable/            # Icons
│   │   │   └── values/              # Strings, Farben
│   │   └── AndroidManifest.xml
│   └── build.gradle.kts
├── build.gradle.kts
├── settings.gradle.kts
└── gradle.properties
```

## Lizenz

Dieses Projekt ist nur für Bildungszwecke gedacht. "Wizard of Wor" ist eine eingetragene Marke von Midway Games.
