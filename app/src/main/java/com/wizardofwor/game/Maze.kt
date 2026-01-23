package com.wizardofwor.game

import kotlin.random.Random

class Maze(val width: Int, val height: Int, private val level: Int = 1) {

    private val grid: Array<BooleanArray> = Array(height) { BooleanArray(width) { false } }

    init {
        generateMaze()
    }

    private fun generateMaze() {
        // Wizard of Wor hat charakteristische Labyrinth-Layouts
        // Wir generieren ein Labyrinth im Stil des Originals

        // Äußere Wände
        for (x in 0 until width) {
            grid[0][x] = true  // Obere Wand
            grid[height - 1][x] = true  // Untere Wand
        }
        for (y in 0 until height) {
            grid[y][0] = true  // Linke Wand
            grid[y][width - 1] = true  // Rechte Wand
        }

        // Öffnungen für Teleport-Türen (links und rechts in der Mitte)
        val doorY = height / 2
        grid[doorY][0] = false
        grid[doorY][width - 1] = false

        // Innere Struktur basierend auf Wizard of Wor Layouts
        when (level % 5) {
            1 -> generateDungeon1()
            2 -> generateDungeon2()
            3 -> generateDungeon3()
            4 -> generateDungeon4()
            0 -> generateDungeon5()
        }
    }

    private fun generateDungeon1() {
        // Arena-Layout: Offener Bereich mit einigen Säulen

        // Horizontale Barrieren
        for (x in 2 until width - 2 step 4) {
            grid[3][x] = true
            grid[3][x + 1] = true
            grid[height - 4][x] = true
            grid[height - 4][x + 1] = true
        }

        // Vertikale Säulen
        for (y in 5 until height - 5) {
            grid[y][5] = true
            grid[y][width - 6] = true
        }

        // Zentrale Struktur
        for (x in width / 2 - 2 until width / 2 + 2) {
            grid[height / 2 - 1][x] = true
            grid[height / 2 + 1][x] = true
        }
    }

    private fun generateDungeon2() {
        // Korridor-Layout

        // Horizontale Korridore
        for (x in 2 until width - 2) {
            if (x % 3 != 0) {
                grid[2][x] = true
                grid[4][x] = true
                grid[height - 3][x] = true
                grid[height - 5][x] = true
            }
        }

        // Vertikale Verbindungen
        for (y in 2 until height - 2) {
            if (y % 2 == 0) {
                grid[y][4] = true
                grid[y][width / 2] = true
                grid[y][width - 5] = true
            }
        }

        // Öffnungen in der Mitte
        grid[height / 2][width / 2] = false
        grid[height / 2][4] = false
        grid[height / 2][width - 5] = false
    }

    private fun generateDungeon3() {
        // Schachbrett-artig

        for (y in 2 until height - 2 step 2) {
            for (x in 2 until width - 2 step 2) {
                if ((x + y) % 4 == 0) {
                    grid[y][x] = true
                    if (x + 1 < width - 2) grid[y][x + 1] = true
                }
            }
        }

        // Pfade freilassen
        for (y in 1 until height - 1) {
            grid[y][width / 2] = false
        }
        for (x in 1 until width - 1) {
            grid[height / 2][x] = false
        }
    }

    private fun generateDungeon4() {
        // Labyrinth mit Räumen

        // Große Räume
        for (x in 3 until 7) {
            for (y in 2 until 5) {
                grid[y][x] = false
            }
        }
        for (x in width - 7 until width - 3) {
            for (y in 2 until 5) {
                grid[y][x] = false
            }
        }

        // Wände um Räume
        for (x in 2 until 8) {
            grid[1][x] = true
            grid[5][x] = true
        }
        for (x in width - 8 until width - 2) {
            grid[1][x] = true
            grid[5][x] = true
        }

        // Vertikale Trennwände
        for (y in 1 until height - 1) {
            grid[y][2] = true
            grid[y][width - 3] = true
        }

        // Durchgänge
        grid[height / 2][2] = false
        grid[height / 2][width - 3] = false
        grid[3][2] = false
        grid[3][width - 3] = false

        // Zentrale Barriere
        for (x in width / 2 - 3 until width / 2 + 3) {
            grid[height / 2 - 2][x] = true
            grid[height / 2 + 2][x] = true
        }
    }

    private fun generateDungeon5() {
        // Boss-Arena (einfacher, offener)

        // Nur einige strategische Säulen
        val positions = listOf(
            Pair(4, 3), Pair(width - 5, 3),
            Pair(4, height - 4), Pair(width - 5, height - 4),
            Pair(width / 2, 3), Pair(width / 2, height - 4)
        )

        for ((x, y) in positions) {
            grid[y][x] = true
            if (x + 1 < width - 1) grid[y][x + 1] = true
            if (y + 1 < height - 1) grid[y + 1][x] = true
            if (x + 1 < width - 1 && y + 1 < height - 1) grid[y + 1][x + 1] = true
        }

        // Zentrales Element
        for (x in width / 2 - 1 until width / 2 + 2) {
            for (y in height / 2 - 1 until height / 2 + 2) {
                grid[y][x] = true
            }
        }
    }

    fun isWall(x: Int, y: Int): Boolean {
        if (x < 0 || x >= width || y < 0 || y >= height) {
            return true
        }
        return grid[y][x]
    }

    fun setWall(x: Int, y: Int, isWall: Boolean) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
            grid[y][x] = isWall
        }
    }

    // Hilfsmethode für Pfadfindung
    fun getNeighbors(x: Int, y: Int): List<Pair<Int, Int>> {
        val neighbors = mutableListOf<Pair<Int, Int>>()

        val directions = listOf(
            Pair(0, -1),  // Oben
            Pair(0, 1),   // Unten
            Pair(-1, 0),  // Links
            Pair(1, 0)    // Rechts
        )

        for ((dx, dy) in directions) {
            val nx = x + dx
            val ny = y + dy
            if (!isWall(nx, ny)) {
                neighbors.add(Pair(nx, ny))
            }
        }

        return neighbors
    }
}
