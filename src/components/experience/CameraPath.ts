// ============================================================
// Camera Path — Cinematic scroll-driven walkthrough
// 8 phases mapped to scroll progress 0-1
// ============================================================

export interface CameraKeyframe {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  label: string;
}

export const CAMERA_PHASES: { range: [number, number]; keyframes: CameraKeyframe[] }[] = [
  // Phase 0-15%: Exterior aerial view
  {
    range: [0, 0.15],
    keyframes: [
      { position: [12, 8, 12], target: [0, 3, 0], fov: 45, label: 'Skyline Reveal' },
      { position: [8, 5, 8], target: [0, 2, 0], fov: 50, label: 'Approach Building' },
    ],
  },
  // Phase 15-30%: Entrance and lobby
  {
    range: [0.15, 0.3],
    keyframes: [
      { position: [4, 2.5, 4], target: [0, 1.2, 0], fov: 55, label: 'Building Entrance' },
      { position: [2.5, 1.5, 2.5], target: [0, 1, 2], fov: 60, label: 'Lobby Reception' },
    ],
  },
  // Phase 30-45%: Elevator transition
  {
    range: [0.3, 0.45],
    keyframes: [
      { position: [1.5, 1.2, 1.5], target: [0, 1.5, 1], fov: 65, label: 'Elevator Doors' },
      { position: [0, 1.8, 2], target: [0, 2.5, 0], fov: 60, label: 'Elevator Ascent' },
    ],
  },
  // Phase 45-60%: Property intelligence floor
  {
    range: [0.45, 0.6],
    keyframes: [
      { position: [3, 3.5, 3], target: [0, 3.5, 0], fov: 50, label: 'Property Intel' },
      { position: [4, 4, 2], target: [1, 3.8, 0], fov: 55, label: 'Market Analytics' },
    ],
  },
  // Phase 60-75%: Global market visualization
  {
    range: [0.6, 0.75],
    keyframes: [
      { position: [5, 4.5, 3], target: [0, 4.5, 0], fov: 50, label: 'Global Markets' },
      { position: [6, 5, 2], target: [0, 5, 0], fov: 48, label: 'World Intelligence' },
    ],
  },
  // Phase 75-90%: Personalized opportunity floor
  {
    range: [0.75, 0.9],
    keyframes: [
      { position: [4, 5.5, 4], target: [0, 5.5, 0], fov: 52, label: 'Your Opportunities' },
      { position: [3, 6, 3], target: [0, 6, 0], fov: 55, label: 'AI Recommendations' },
    ],
  },
  // Phase 90-100%: Call-to-action
  {
    range: [0.9, 1],
    keyframes: [
      { position: [5, 6.5, 5], target: [0, 6, 0], fov: 45, label: 'Commission Model' },
      { position: [8, 7, 8], target: [0, 4, 0], fov: 42, label: 'Global Overview' },
    ],
  },
];

export function getCameraAtProgress(progress: number): CameraKeyframe {
  const clamped = Math.max(0, Math.min(1, progress));
  
  // Find which phase we're in
  const phase = CAMERA_PHASES.find(p => clamped >= p.range[0] && clamped <= p.range[1]);
  
  if (!phase) {
    // Fallback — return the last keyframe of the nearest phase
    return CAMERA_PHASES[CAMERA_PHASES.length - 1].keyframes[CAMERA_PHASES[CAMERA_PHASES.length - 1].keyframes.length - 1];
  }

  const phaseProgress = (clamped - phase.range[0]) / (phase.range[1] - phase.range[0]);
  const keyframes = phase.keyframes;
  const keyframeIndex = Math.min(Math.floor(phaseProgress * (keyframes.length - 1)), keyframes.length - 2);
  const nextIndex = Math.min(keyframeIndex + 1, keyframes.length - 1);
  const localProgress = (phaseProgress * (keyframes.length - 1)) - keyframeIndex;

  const a = keyframes[keyframeIndex];
  const b = keyframes[nextIndex];

  // Smooth interpolation
  const t = localProgress * localProgress * (3 - 2 * localProgress); // smoothstep

  return {
    position: [
      a.position[0] + (b.position[0] - a.position[0]) * t,
      a.position[1] + (b.position[1] - a.position[1]) * t,
      a.position[2] + (b.position[2] - a.position[2]) * t,
    ] as [number, number, number],
    target: [
      a.target[0] + (b.target[0] - a.target[0]) * t,
      a.target[1] + (b.target[1] - a.target[1]) * t,
      a.target[2] + (b.target[2] - a.target[2]) * t,
    ] as [number, number, number],
    fov: a.fov + (b.fov - a.fov) * t,
    label: progress >= 0.9 ? 'Commission Model' : keyframes[keyframeIndex].label,
  };
}

export function getPhaseLabel(progress: number): string {
  const phase = CAMERA_PHASES.find(p => progress >= p.range[0] && progress <= p.range[1]);
  if (!phase) return '';
  const mid = phase.keyframes[Math.floor(phase.keyframes.length / 2)];
  return mid.label;
}
