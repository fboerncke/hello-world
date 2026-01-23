package com.wizardofwor.game

import kotlin.math.abs
import kotlin.random.Random

class GameEngine(private val screenWidth: Int, private val screenHeight: Int) {

    // Spielfeld-Dimensionen (basierend auf Original Wizard of Wor)
    private val mazeWidth = 21
    private val mazeHeight = 13

    val cellWidth: Float = screenWidth.toFloat() / mazeWidth
    val cellHeight: Float = screenHeight.toFloat() / mazeHeight

    var maze = Maze(mazeWidth, mazeHeight)
    var player = Player(cellWidth, cellHeight * 11)
    val enemies = mutableListOf<Enemy>()
    val bullets = mutableListOf<Bullet>()

    var score = 0
    var highScore = 0
    var lives = 3
    var level = 1

    var isGameOver = false
    var isLevelComplete = false

    private var lastEnemySpawnTime = 0L
    private var wizardSpawned = false
    private var worlukSpawned = false

    private val moveSpeed = cellWidth / 8
    private val bulletSpeed = cellWidth / 4

    init {
        initLevel()
    }

    private fun initLevel() {
        maze = Maze(mazeWidth, mazeHeight, level)
        enemies.clear()
        bullets.clear()

        // Spieler-Startposition (unten Mitte)
        player.x = cellWidth * (mazeWidth / 2)
        player.y = cellHeight * (mazeHeight - 2)
        player.isAlive = true

        // Gegner spawnen basierend auf Level
        spawnInitialEnemies()

        wizardSpawned = false
        worlukSpawned = false
        isLevelComplete = false
    }

    private fun spawnInitialEnemies() {
        val numBurwors = minOf(6, 3 + level / 2)
        val numGarwors = if (level >= 2) minOf(3, level / 2) else 0
        val numThorwors = if (level >= 4) minOf(2, (level - 2) / 2) else 0

        repeat(numBurwors) { spawnEnemy(EnemyType.BURWOR) }
        repeat(numGarwors) { spawnEnemy(EnemyType.GARWOR) }
        repeat(numThorwors) { spawnEnemy(EnemyType.THORWOR) }
    }

    private fun spawnEnemy(type: EnemyType) {
        // Finde eine freie Position für den Gegner (oben im Labyrinth)
        var attempts = 0
        while (attempts < 50) {
            val gridX = Random.nextInt(1, mazeWidth - 1)
            val gridY = Random.nextInt(1, mazeHeight / 2)

            if (!maze.isWall(gridX, gridY)) {
                val enemy = Enemy(
                    x = gridX * cellWidth,
                    y = gridY * cellHeight,
                    type = type
                )
                enemies.add(enemy)
                return
            }
            attempts++
        }
    }

    fun update() {
        if (isGameOver || isLevelComplete) return

        updatePlayer()
        updateEnemies()
        updateBullets()
        checkCollisions()
        checkLevelComplete()
        maybeSpawnSpecialEnemies()
    }

    private fun updatePlayer() {
        if (!player.isAlive) return

        // Bewegung basierend auf Richtung
        var newX = player.x
        var newY = player.y

        when (player.direction) {
            Direction.UP -> newY -= moveSpeed
            Direction.DOWN -> newY += moveSpeed
            Direction.LEFT -> newX -= moveSpeed
            Direction.RIGHT -> newX += moveSpeed
            Direction.NONE -> {}
        }

        // Kollision mit Wänden prüfen
        if (canMoveTo(newX, newY)) {
            player.x = newX
            player.y = newY
        }

        // Teleport-Türen
        checkTeleport(player)
    }

    private fun updateEnemies() {
        for (enemy in enemies) {
            if (!enemy.isAlive) continue

            // KI-Bewegung
            enemy.updateAI(this)

            var newX = enemy.x
            var newY = enemy.y

            when (enemy.direction) {
                Direction.UP -> newY -= enemy.speed
                Direction.DOWN -> newY += enemy.speed
                Direction.LEFT -> newX -= enemy.speed
                Direction.RIGHT -> newX += enemy.speed
                Direction.NONE -> {}
            }

            if (canMoveTo(newX, newY)) {
                enemy.x = newX
                enemy.y = newY
            } else {
                // Richtung ändern wenn blockiert
                enemy.changeDirection()
            }

            // Teleport-Türen für Gegner
            checkTeleport(enemy)

            // Unsichtbarkeit für bestimmte Gegner
            if (enemy.type == EnemyType.GARWOR || enemy.type == EnemyType.THORWOR) {
                enemy.updateInvisibility()
            }

            // Gegner schießen manchmal
            if (enemy.canFire() && Random.nextFloat() < 0.02f) {
                enemyFire(enemy)
            }
        }
    }

    private fun updateBullets() {
        val bulletsToRemove = mutableListOf<Bullet>()

        for (bullet in bullets) {
            when (bullet.direction) {
                Direction.UP -> bullet.y -= bulletSpeed
                Direction.DOWN -> bullet.y += bulletSpeed
                Direction.LEFT -> bullet.x -= bulletSpeed
                Direction.RIGHT -> bullet.x += bulletSpeed
                Direction.NONE -> {}
            }

            // Prüfen ob Schuss eine Wand trifft
            val gridX = (bullet.x / cellWidth).toInt()
            val gridY = (bullet.y / cellHeight).toInt()

            if (gridX < 0 || gridX >= mazeWidth || gridY < 0 || gridY >= mazeHeight) {
                bulletsToRemove.add(bullet)
            } else if (maze.isWall(gridX, gridY)) {
                bulletsToRemove.add(bullet)
            }
        }

        bullets.removeAll(bulletsToRemove)
    }

    private fun checkCollisions() {
        // Spieler-Gegner Kollision
        for (enemy in enemies) {
            if (!enemy.isAlive) continue

            if (checkEntityCollision(player, enemy)) {
                playerHit()
                return
            }
        }

        // Schuss-Kollisionen
        val bulletsToRemove = mutableListOf<Bullet>()

        for (bullet in bullets) {
            if (bullet.isPlayerBullet) {
                // Spieler-Schuss trifft Gegner
                for (enemy in enemies) {
                    if (!enemy.isAlive) continue

                    if (checkBulletHit(bullet, enemy)) {
                        enemy.isAlive = false
                        score += enemy.pointValue
                        if (score > highScore) highScore = score
                        bulletsToRemove.add(bullet)
                        break
                    }
                }
            } else {
                // Gegner-Schuss trifft Spieler
                if (checkBulletHit(bullet, player)) {
                    bulletsToRemove.add(bullet)
                    playerHit()
                    return
                }
            }
        }

        bullets.removeAll(bulletsToRemove)
    }

    private fun checkEntityCollision(entity1: Entity, entity2: Entity): Boolean {
        val dx = abs(entity1.x - entity2.x)
        val dy = abs(entity1.y - entity2.y)
        return dx < cellWidth * 0.7f && dy < cellHeight * 0.7f
    }

    private fun checkBulletHit(bullet: Bullet, entity: Entity): Boolean {
        val dx = abs(bullet.x - (entity.x + cellWidth / 2))
        val dy = abs(bullet.y - (entity.y + cellHeight / 2))
        return dx < cellWidth / 2 && dy < cellHeight / 2
    }

    private fun playerHit() {
        lives--
        if (lives <= 0) {
            isGameOver = true
            player.isAlive = false
        } else {
            // Spieler zurücksetzen
            player.x = cellWidth * (mazeWidth / 2)
            player.y = cellHeight * (mazeHeight - 2)
            player.direction = Direction.NONE
        }
    }

    private fun checkLevelComplete() {
        val aliveEnemies = enemies.count { it.isAlive }
        if (aliveEnemies == 0) {
            isLevelComplete = true
        }
    }

    private fun maybeSpawnSpecialEnemies() {
        val aliveEnemies = enemies.count { it.isAlive }

        // Worluk spawnt wenn nur noch wenige Gegner übrig sind
        if (!worlukSpawned && aliveEnemies <= 2 && aliveEnemies > 0) {
            spawnEnemy(EnemyType.WORLUK)
            worlukSpawned = true
        }

        // Wizard spawnt wenn nur noch 1 Gegner übrig ist
        if (!wizardSpawned && aliveEnemies == 1) {
            spawnEnemy(EnemyType.WIZARD)
            wizardSpawned = true
        }
    }

    fun movePlayer(direction: Direction) {
        player.direction = direction
    }

    fun stopPlayer() {
        player.direction = Direction.NONE
    }

    fun playerFire() {
        if (!player.isAlive) return

        // Nur ein Schuss gleichzeitig
        if (bullets.any { it.isPlayerBullet }) return

        val bullet = Bullet(
            x = player.x + cellWidth / 2,
            y = player.y + cellHeight / 2,
            direction = if (player.direction == Direction.NONE) Direction.UP else player.direction,
            isPlayerBullet = true
        )
        bullets.add(bullet)
    }

    private fun enemyFire(enemy: Enemy) {
        // Gegner schießt in Richtung des Spielers
        val dx = player.x - enemy.x
        val dy = player.y - enemy.y

        val direction = if (abs(dx) > abs(dy)) {
            if (dx > 0) Direction.RIGHT else Direction.LEFT
        } else {
            if (dy > 0) Direction.DOWN else Direction.UP
        }

        val bullet = Bullet(
            x = enemy.x + cellWidth / 2,
            y = enemy.y + cellHeight / 2,
            direction = direction,
            isPlayerBullet = false
        )
        bullets.add(bullet)
    }

    private fun canMoveTo(x: Float, y: Float): Boolean {
        // Prüfe alle 4 Ecken des Charakters
        val padding = cellWidth * 0.1f

        val corners = listOf(
            Pair(x + padding, y + padding),
            Pair(x + cellWidth - padding, y + padding),
            Pair(x + padding, y + cellHeight - padding),
            Pair(x + cellWidth - padding, y + cellHeight - padding)
        )

        for ((cx, cy) in corners) {
            val gridX = (cx / cellWidth).toInt()
            val gridY = (cy / cellHeight).toInt()

            if (gridX < 0 || gridX >= mazeWidth || gridY < 0 || gridY >= mazeHeight) {
                return false
            }

            if (maze.isWall(gridX, gridY)) {
                return false
            }
        }

        return true
    }

    private fun checkTeleport(entity: Entity) {
        val doorY = mazeHeight / 2

        // Linke Tür
        if (entity.x < 0 && entity.direction == Direction.LEFT) {
            val gridY = (entity.y / cellHeight).toInt()
            if (gridY == doorY) {
                entity.x = (mazeWidth - 1) * cellWidth
            }
        }

        // Rechte Tür
        if (entity.x > (mazeWidth - 1) * cellWidth && entity.direction == Direction.RIGHT) {
            val gridY = (entity.y / cellHeight).toInt()
            if (gridY == doorY) {
                entity.x = 0f
            }
        }
    }

    fun restart() {
        score = 0
        lives = 3
        level = 1
        isGameOver = false
        initLevel()
    }

    fun nextLevel() {
        level++
        initLevel()
    }

    // Hilfsmethode für KI
    fun getPlayerGridPosition(): Pair<Int, Int> {
        return Pair(
            (player.x / cellWidth).toInt(),
            (player.y / cellHeight).toInt()
        )
    }
}
