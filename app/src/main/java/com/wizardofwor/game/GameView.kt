package com.wizardofwor.game

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.view.MotionEvent
import android.view.SurfaceHolder
import android.view.SurfaceView

class GameView(context: Context) : SurfaceView(context), SurfaceHolder.Callback, Runnable {

    private var gameThread: Thread? = null
    private var isPlaying = false
    private val paint = Paint()
    private lateinit var gameEngine: GameEngine

    // Touch-Steuerung
    private var touchStartX = 0f
    private var touchStartY = 0f

    // UI-Bereiche für Touch-Buttons
    private val buttonUp = RectF()
    private val buttonDown = RectF()
    private val buttonLeft = RectF()
    private val buttonRight = RectF()
    private val buttonFire = RectF()

    init {
        holder.addCallback(this)
        isFocusable = true
    }

    override fun surfaceCreated(holder: SurfaceHolder) {
        gameEngine = GameEngine(width, height)
        setupControlButtons()
        resume()
    }

    override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {
        gameEngine = GameEngine(width, height)
        setupControlButtons()
    }

    override fun surfaceDestroyed(holder: SurfaceHolder) {
        pause()
    }

    private fun setupControlButtons() {
        val buttonSize = height / 6f
        val margin = 20f
        val bottomY = height - buttonSize - margin

        // D-Pad auf der linken Seite
        val dpadCenterX = buttonSize * 1.5f + margin
        val dpadCenterY = bottomY - buttonSize / 2

        buttonUp.set(
            dpadCenterX - buttonSize / 2,
            dpadCenterY - buttonSize * 1.2f,
            dpadCenterX + buttonSize / 2,
            dpadCenterY - buttonSize * 0.2f
        )
        buttonDown.set(
            dpadCenterX - buttonSize / 2,
            dpadCenterY + buttonSize * 0.2f,
            dpadCenterX + buttonSize / 2,
            dpadCenterY + buttonSize * 1.2f
        )
        buttonLeft.set(
            dpadCenterX - buttonSize * 1.2f,
            dpadCenterY - buttonSize / 2,
            dpadCenterX - buttonSize * 0.2f,
            dpadCenterY + buttonSize / 2
        )
        buttonRight.set(
            dpadCenterX + buttonSize * 0.2f,
            dpadCenterY - buttonSize / 2,
            dpadCenterX + buttonSize * 1.2f,
            dpadCenterY + buttonSize / 2
        )

        // Feuer-Button auf der rechten Seite
        buttonFire.set(
            width - buttonSize * 1.5f - margin,
            dpadCenterY - buttonSize / 2,
            width - margin,
            dpadCenterY + buttonSize / 2
        )
    }

    override fun run() {
        while (isPlaying) {
            val startTime = System.currentTimeMillis()

            if (holder.surface.isValid) {
                val canvas = holder.lockCanvas()
                canvas?.let {
                    gameEngine.update()
                    draw(it)
                    holder.unlockCanvasAndPost(it)
                }
            }

            // 60 FPS anstreben
            val frameTime = System.currentTimeMillis() - startTime
            if (frameTime < 16) {
                try {
                    Thread.sleep(16 - frameTime)
                } catch (e: InterruptedException) {
                    // Ignorieren
                }
            }
        }
    }

    override fun draw(canvas: Canvas) {
        super.draw(canvas)

        // Hintergrund
        canvas.drawColor(Color.BLACK)

        // Labyrinth zeichnen
        drawMaze(canvas)

        // Spieler zeichnen
        drawPlayer(canvas)

        // Gegner zeichnen
        drawEnemies(canvas)

        // Schüsse zeichnen
        drawBullets(canvas)

        // UI zeichnen
        drawUI(canvas)

        // Steuerung zeichnen
        drawControls(canvas)

        // Game Over oder Level Complete
        if (gameEngine.isGameOver) {
            drawGameOver(canvas)
        } else if (gameEngine.isLevelComplete) {
            drawLevelComplete(canvas)
        }
    }

    private fun drawMaze(canvas: Canvas) {
        paint.color = Color.BLUE
        paint.style = Paint.Style.FILL

        val maze = gameEngine.maze
        val cellWidth = gameEngine.cellWidth
        val cellHeight = gameEngine.cellHeight

        for (y in 0 until maze.height) {
            for (x in 0 until maze.width) {
                if (maze.isWall(x, y)) {
                    canvas.drawRect(
                        x * cellWidth,
                        y * cellHeight,
                        (x + 1) * cellWidth,
                        (y + 1) * cellHeight,
                        paint
                    )
                }
            }
        }

        // Teleport-Türen zeichnen (links und rechts)
        paint.color = Color.MAGENTA
        val doorY = maze.height / 2
        canvas.drawRect(0f, doorY * cellHeight, cellWidth / 2, (doorY + 1) * cellHeight, paint)
        canvas.drawRect(
            width - cellWidth / 2,
            doorY * cellHeight,
            width.toFloat(),
            (doorY + 1) * cellHeight,
            paint
        )
    }

    private fun drawPlayer(canvas: Canvas) {
        val player = gameEngine.player
        if (!player.isAlive) return

        paint.color = Color.YELLOW
        paint.style = Paint.Style.FILL

        val centerX = player.x + gameEngine.cellWidth / 2
        val centerY = player.y + gameEngine.cellHeight / 2
        val radius = minOf(gameEngine.cellWidth, gameEngine.cellHeight) / 3

        canvas.drawCircle(centerX, centerY, radius, paint)

        // Richtungsanzeiger
        paint.color = Color.RED
        val dirX = when (player.direction) {
            Direction.LEFT -> -radius
            Direction.RIGHT -> radius
            else -> 0f
        }
        val dirY = when (player.direction) {
            Direction.UP -> -radius
            Direction.DOWN -> radius
            else -> 0f
        }
        canvas.drawCircle(centerX + dirX * 0.7f, centerY + dirY * 0.7f, radius / 3, paint)
    }

    private fun drawEnemies(canvas: Canvas) {
        for (enemy in gameEngine.enemies) {
            if (!enemy.isAlive) continue

            paint.color = when (enemy.type) {
                EnemyType.BURWOR -> Color.RED
                EnemyType.GARWOR -> Color.CYAN
                EnemyType.THORWOR -> Color.MAGENTA
                EnemyType.WORLUK -> Color.GREEN
                EnemyType.WIZARD -> Color.WHITE
            }
            paint.style = Paint.Style.FILL

            val centerX = enemy.x + gameEngine.cellWidth / 2
            val centerY = enemy.y + gameEngine.cellHeight / 2
            val radius = minOf(gameEngine.cellWidth, gameEngine.cellHeight) / 3

            // Verschiedene Formen für verschiedene Gegner
            when (enemy.type) {
                EnemyType.BURWOR -> {
                    // Einfacher Kreis
                    canvas.drawCircle(centerX, centerY, radius, paint)
                }
                EnemyType.GARWOR -> {
                    // Quadrat
                    canvas.drawRect(
                        centerX - radius,
                        centerY - radius,
                        centerX + radius,
                        centerY + radius,
                        paint
                    )
                }
                EnemyType.THORWOR -> {
                    // Dreieck
                    val path = android.graphics.Path()
                    path.moveTo(centerX, centerY - radius)
                    path.lineTo(centerX - radius, centerY + radius)
                    path.lineTo(centerX + radius, centerY + radius)
                    path.close()
                    canvas.drawPath(path, paint)
                }
                EnemyType.WORLUK -> {
                    // Stern
                    canvas.drawCircle(centerX, centerY, radius, paint)
                    paint.color = Color.BLACK
                    canvas.drawCircle(centerX, centerY, radius / 2, paint)
                    paint.color = Color.GREEN
                }
                EnemyType.WIZARD -> {
                    // Wizard - größerer Charakter
                    canvas.drawCircle(centerX, centerY, radius * 1.2f, paint)
                    paint.color = Color.BLACK
                    canvas.drawCircle(centerX - radius / 3, centerY - radius / 4, radius / 5, paint)
                    canvas.drawCircle(centerX + radius / 3, centerY - radius / 4, radius / 5, paint)
                }
            }

            // Unsichtbare Gegner blinken
            if (enemy.isInvisible && (System.currentTimeMillis() / 200) % 2 == 0L) {
                paint.color = Color.BLACK
                canvas.drawCircle(centerX, centerY, radius, paint)
            }
        }
    }

    private fun drawBullets(canvas: Canvas) {
        paint.color = Color.WHITE
        paint.style = Paint.Style.FILL

        for (bullet in gameEngine.bullets) {
            canvas.drawCircle(bullet.x, bullet.y, 5f, paint)
        }
    }

    private fun drawUI(canvas: Canvas) {
        paint.color = Color.WHITE
        paint.textSize = 40f
        paint.style = Paint.Style.FILL

        // Punktzahl
        canvas.drawText("SCORE: ${gameEngine.score}", 20f, 50f, paint)

        // Level
        canvas.drawText("LEVEL: ${gameEngine.level}", width / 2f - 60f, 50f, paint)

        // Leben
        canvas.drawText("LIVES: ${gameEngine.lives}", width - 200f, 50f, paint)

        // High Score
        paint.textSize = 30f
        canvas.drawText("HIGH: ${gameEngine.highScore}", 20f, 90f, paint)
    }

    private fun drawControls(canvas: Canvas) {
        paint.color = Color.argb(100, 255, 255, 255)
        paint.style = Paint.Style.FILL

        // D-Pad
        canvas.drawRoundRect(buttonUp, 10f, 10f, paint)
        canvas.drawRoundRect(buttonDown, 10f, 10f, paint)
        canvas.drawRoundRect(buttonLeft, 10f, 10f, paint)
        canvas.drawRoundRect(buttonRight, 10f, 10f, paint)

        // Feuer-Button
        paint.color = Color.argb(100, 255, 0, 0)
        canvas.drawOval(buttonFire, paint)

        // Button-Beschriftungen
        paint.color = Color.WHITE
        paint.textSize = 30f
        paint.textAlign = Paint.Align.CENTER

        canvas.drawText("▲", buttonUp.centerX(), buttonUp.centerY() + 10, paint)
        canvas.drawText("▼", buttonDown.centerX(), buttonDown.centerY() + 10, paint)
        canvas.drawText("◄", buttonLeft.centerX(), buttonLeft.centerY() + 10, paint)
        canvas.drawText("►", buttonRight.centerX(), buttonRight.centerY() + 10, paint)
        canvas.drawText("FIRE", buttonFire.centerX(), buttonFire.centerY() + 10, paint)

        paint.textAlign = Paint.Align.LEFT
    }

    private fun drawGameOver(canvas: Canvas) {
        paint.color = Color.argb(200, 0, 0, 0)
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), paint)

        paint.color = Color.RED
        paint.textSize = 80f
        paint.textAlign = Paint.Align.CENTER
        canvas.drawText("GAME OVER", width / 2f, height / 2f, paint)

        paint.color = Color.WHITE
        paint.textSize = 40f
        canvas.drawText("SCORE: ${gameEngine.score}", width / 2f, height / 2f + 60f, paint)
        canvas.drawText("Tap to restart", width / 2f, height / 2f + 120f, paint)

        paint.textAlign = Paint.Align.LEFT
    }

    private fun drawLevelComplete(canvas: Canvas) {
        paint.color = Color.argb(200, 0, 0, 0)
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), paint)

        paint.color = Color.GREEN
        paint.textSize = 60f
        paint.textAlign = Paint.Align.CENTER
        canvas.drawText("LEVEL ${gameEngine.level} COMPLETE!", width / 2f, height / 2f, paint)

        paint.color = Color.WHITE
        paint.textSize = 40f
        canvas.drawText("Tap to continue", width / 2f, height / 2f + 60f, paint)

        paint.textAlign = Paint.Align.LEFT
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.action) {
            MotionEvent.ACTION_DOWN, MotionEvent.ACTION_MOVE -> {
                touchStartX = event.x
                touchStartY = event.y

                // Prüfen welcher Button gedrückt wurde
                when {
                    gameEngine.isGameOver -> {
                        if (event.action == MotionEvent.ACTION_DOWN) {
                            gameEngine.restart()
                        }
                    }
                    gameEngine.isLevelComplete -> {
                        if (event.action == MotionEvent.ACTION_DOWN) {
                            gameEngine.nextLevel()
                        }
                    }
                    buttonUp.contains(event.x, event.y) -> {
                        gameEngine.movePlayer(Direction.UP)
                    }
                    buttonDown.contains(event.x, event.y) -> {
                        gameEngine.movePlayer(Direction.DOWN)
                    }
                    buttonLeft.contains(event.x, event.y) -> {
                        gameEngine.movePlayer(Direction.LEFT)
                    }
                    buttonRight.contains(event.x, event.y) -> {
                        gameEngine.movePlayer(Direction.RIGHT)
                    }
                    buttonFire.contains(event.x, event.y) -> {
                        if (event.action == MotionEvent.ACTION_DOWN) {
                            gameEngine.playerFire()
                        }
                    }
                }
            }
            MotionEvent.ACTION_UP -> {
                gameEngine.stopPlayer()
            }
        }
        return true
    }

    fun pause() {
        isPlaying = false
        try {
            gameThread?.join()
        } catch (e: InterruptedException) {
            // Ignorieren
        }
    }

    fun resume() {
        isPlaying = true
        gameThread = Thread(this)
        gameThread?.start()
    }
}
