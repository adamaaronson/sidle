import Level from '../classes/game/Level';
import '../styles/Debug.scss';

type Props = {
    level: Level;
};

export default function Debug({ level }: Props) {
    const debugData = {
        'player timestamp': level.player.lastUpdated,
        'player width': level.player.width,
        'player height': level.player.height,
        'position x': level.player.position.x,
        'position y': level.player.position.y,
        'unrounded x': level.player.unroundedPosition.x,
        'unrounded y': level.player.unroundedPosition.y,
        'velocity x': level.player.velocity.x,
        'velocity y': level.player.velocity.y,
        'acceleration x': level.player.acceleration.x,
        'acceleration y': level.player.acceleration.y,
        'subentity xs': level.player.subentities.map((subentity) => subentity.position.x).join(', '),
        'subentity ys': level.player.subentities.map((subentity) => subentity.position.y).join(', '),
    };

    const debugConditions = {
        jumping: level.player.isJumping,
        movingRight: level.player.isMovingRight,
        movingLeft: level.player.isMovingLeft,
        bottomTouching: level.player.isBottomTouching(level.blocks),
        topTouching: level.player.isTopTouching(level.blocks),
        leftTouching: level.player.isLeftTouching(level.blocks),
        rightTouching: level.player.isRightTouching(level.blocks),
        topLeftTouching: level.player.isTopLeftTouching(level.blocks),
        topRightTouching: level.player.isTopRightTouching(level.blocks),
        bottomLeftTouching: level.player.isBottomLeftTouching(level.blocks),
        bottomRightTouching: level.player.isBottomRightTouching(level.blocks),
    };

    return (
        <div className="debug-dashboard">
            {Object.entries(debugData).map(([key, value]) => (
                <p key={key}>
                    {key} = {value}
                </p>
            ))}
            <br />
            {Object.entries(debugConditions)
                .filter(([_, value]) => value)
                .map(([key, _]) => (
                    <p key={key}>{key}</p>
                ))}
        </div>
    );
}
