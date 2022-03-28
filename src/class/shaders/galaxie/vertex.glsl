uniform float uTime;
uniform float uSize;

attribute float aScale;
attribute vec3 aRandomness;

varying vec3 vColor;

void main(){
/**
    * Position
    */
vec4 modelPosition = modelMatrix * vec4(position, 1.0);


/** Move Particle Circular on the X and Z***/

// 1st : Get the angle of the particle
float angle = atan(modelPosition.x, modelPosition.z);
// 2nd : Get the distance form the center
float distanceToCenter = length(modelPosition.xz);
// 3rd : Calculate offset angle
float angleOffset = (1.0 / distanceToCenter) * uTime * 0.025;
// 4rd : Add offset angle to the base angle
angle += angleOffset;
modelPosition.z = sin(angle) * distanceToCenter;
modelPosition.y = sin(angle) * distanceToCenter;

// Randomness
modelPosition.xyz += aRandomness;


vec4 viewPosition = viewMatrix * modelPosition;
vec4 projectedPosition = projectionMatrix * viewPosition;

gl_Position = projectedPosition;



/**
    * Size
    */
gl_PointSize = uSize * aScale;
// Size attenuation (far particles are small, near particles are big)
gl_PointSize *= (1.0 / - viewPosition.z);

/**
 * Var
 */
 vColor = color;

}