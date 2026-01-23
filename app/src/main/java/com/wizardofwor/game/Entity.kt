package com.wizardofwor.game

enum class Direction {
    UP, DOWN, LEFT, RIGHT, NONE
}

open class Entity(
    var x: Float = 0f,
    var y: Float = 0f,
    var direction: Direction = Direction.NONE,
    var isAlive: Boolean = true
)

class Player(
    x: Float = 0f,
    y: Float = 0f
) : Entity(x, y, Direction.NONE, true)

data class Bullet(
    var x: Float,
    var y: Float,
    val direction: Direction,
    val isPlayerBullet: Boolean
)
