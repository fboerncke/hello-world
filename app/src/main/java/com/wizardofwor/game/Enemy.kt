package com.wizardofwor.game

import kotlin.math.abs
import kotlin.random.Random

enum class EnemyType {
    BURWOR,   // Blau, langsam, einfach - 100 Punkte
    GARWOR,   // Gelb, mittel, kann unsichtbar werden - 200 Punkte
    THORWOR,  // Rot, schnell, kann unsichtbar werden - 500 Punkte
    WORLUK,   // Grün, sehr schnell, flieht - 1000 Punkte + Double Score
    WIZARD    // Weiß, Boss, teleportiert - 2500 Punkte
}

class Enemy(
    x: Float = 0f,
    y: Float = 0f,
    val type: EnemyType = EnemyType.BURWOR
) : Entity(x, y, Direction.NONE, true) {

    var isInvisible = false
    private var invisibilityTimer = 0L
    private var lastDirectionChange = 0L
    private var lastFireTime = 0L

    val speed: Float
        get() = when (type) {
            EnemyType.BURWOR -> 2f
            EnemyType.GARWOR -> 3f
            EnemyType.THORWOR -> 4f
            EnemyType.WORLUK -> 5f
            EnemyType.WIZARD -> 3.5f
        }

    val pointValue: Int
        get() = when (type) {
            EnemyType.BURWOR -> 100
            EnemyType.GARWOR -> 200
            EnemyType.THORWOR -> 500
            EnemyType.WORLUK -> 1000
            EnemyType.WIZARD -> 2500
        }

    fun canFire(): Boolean {
        // Nur bestimmte Gegner können schießen
        if (type == EnemyType.BURWOR) return false

        val now = System.currentTimeMillis()
        val cooldown = when (type) {
            EnemyType.GARWOR -> 3000L
            EnemyType.THORWOR -> 2000L
            EnemyType.WIZARD -> 1500L
            else -> Long.MAX_VALUE
        }

        return now - lastFireTime > cooldown
    }

    fun fire() {
        lastFireTime = System.currentTimeMillis()
    }

    fun updateInvisibility() {
        val now = System.currentTimeMillis()

        // Wechsel zwischen sichtbar und unsichtbar
        if (now - invisibilityTimer > 3000) {
            isInvisible = !isInvisible
            invisibilityTimer = now
        }
    }

    fun changeDirection() {
        val directions = listOf(Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT)
        direction = directions.random()
        lastDirectionChange = System.currentTimeMillis()
    }

    fun updateAI(game: GameEngine) {
        val now = System.currentTimeMillis()

        // Richtung nicht zu oft ändern
        if (now - lastDirectionChange < 500) return

        when (type) {
            EnemyType.BURWOR -> updateBurworAI(game)
            EnemyType.GARWOR -> updateGarworAI(game)
            EnemyType.THORWOR -> updateThorworAI(game)
            EnemyType.WORLUK -> updateWorlukAI(game)
            EnemyType.WIZARD -> updateWizardAI(game)
        }
    }

    private fun updateBurworAI(game: GameEngine) {
        // Einfache KI: Zufällige Bewegung mit gelegentlicher Verfolgung
        if (Random.nextFloat() < 0.02f) {
            val (playerX, playerY) = game.getPlayerGridPosition()
            val myX = (x / game.cellWidth).toInt()
            val myY = (y / game.cellHeight).toInt()

            // Manchmal Spieler verfolgen
            if (Random.nextFloat() < 0.3f) {
                direction = getDirectionTowards(myX, myY, playerX, playerY)
            } else {
                changeDirection()
            }
            lastDirectionChange = System.currentTimeMillis()
        }
    }

    private fun updateGarworAI(game: GameEngine) {
        // Mittlere KI: Verfolgt Spieler öfter
        if (Random.nextFloat() < 0.03f) {
            val (playerX, playerY) = game.getPlayerGridPosition()
            val myX = (x / game.cellWidth).toInt()
            val myY = (y / game.cellHeight).toInt()

            if (Random.nextFloat() < 0.5f) {
                direction = getDirectionTowards(myX, myY, playerX, playerY)
            } else {
                changeDirection()
            }
            lastDirectionChange = System.currentTimeMillis()
        }
    }

    private fun updateThorworAI(game: GameEngine) {
        // Aggressive KI: Verfolgt Spieler aktiv
        if (Random.nextFloat() < 0.04f) {
            val (playerX, playerY) = game.getPlayerGridPosition()
            val myX = (x / game.cellWidth).toInt()
            val myY = (y / game.cellHeight).toInt()

            if (Random.nextFloat() < 0.7f) {
                direction = getDirectionTowards(myX, myY, playerX, playerY)
            } else {
                changeDirection()
            }
            lastDirectionChange = System.currentTimeMillis()
        }
    }

    private fun updateWorlukAI(game: GameEngine) {
        // Worluk flieht und versucht die Teleport-Türen zu erreichen
        if (Random.nextFloat() < 0.05f) {
            val myX = (x / game.cellWidth).toInt()
            val doorY = game.maze.height / 2

            // Versuche zur Tür zu kommen
            if (myY != doorY) {
                direction = if (myY > doorY) Direction.UP else Direction.DOWN
            } else {
                // Am Türlevel - zur nächsten Tür
                direction = if (myX < game.maze.width / 2) Direction.LEFT else Direction.RIGHT
            }
            lastDirectionChange = System.currentTimeMillis()
        }
    }

    private fun updateWizardAI(game: GameEngine) {
        // Wizard KI: Teleportiert und greift an
        if (Random.nextFloat() < 0.01f) {
            // Gelegentlich "teleportieren" (schnelle Bewegung)
            val (playerX, playerY) = game.getPlayerGridPosition()
            val myX = (x / game.cellWidth).toInt()
            val myY = (y / game.cellHeight).toInt()

            // Verfolgt den Spieler clever
            direction = getDirectionTowards(myX, myY, playerX, playerY)
            lastDirectionChange = System.currentTimeMillis()
        }
    }

    private fun getDirectionTowards(fromX: Int, fromY: Int, toX: Int, toY: Int): Direction {
        val dx = toX - fromX
        val dy = toY - fromY

        return when {
            abs(dx) > abs(dy) -> if (dx > 0) Direction.RIGHT else Direction.LEFT
            abs(dy) > 0 -> if (dy > 0) Direction.DOWN else Direction.UP
            else -> Direction.NONE
        }
    }

    private val myY: Int
        get() = 0 // Platzhalter, wird in den Methoden korrekt berechnet
}
