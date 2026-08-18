import type { FormulaSnippet } from '../types'

const A = "3-2-1 yaw-pitch-roll to quaternion; SI rad."

export const quaternionEulerSnippets: FormulaSnippet = {
  formulaId: 'quaternion-euler',
  assumptions: A,
  code: {
    python:
      "# 3-2-1 yaw-pitch-roll to quaternion; SI rad.\nimport math\ncy = math.cos(yaw / 2.0)\nsy = math.sin(yaw / 2.0)\ncp = math.cos(pitch / 2.0)\nsp = math.sin(pitch / 2.0)\ncr = math.cos(roll / 2.0)\nsr = math.sin(roll / 2.0)\nqw = cr * cp * cy + sr * sp * sy\nqx = sr * cp * cy - cr * sp * sy\nqy = cr * sp * cy + sr * cp * sy\nqz = cr * cp * sy - sr * sp * cy",
    javascript:
      "// 3-2-1 yaw-pitch-roll to quaternion; SI rad.\nconst cy = Math.cos(yaw / 2.0)\nconst sy = Math.sin(yaw / 2.0)\nconst cp = Math.cos(pitch / 2.0)\nconst sp = Math.sin(pitch / 2.0)\nconst cr = Math.cos(roll / 2.0)\nconst sr = Math.sin(roll / 2.0)\nconst qw = cr * cp * cy + sr * sp * sy\nconst qx = sr * cp * cy - cr * sp * sy\nconst qy = cr * sp * cy + sr * cp * sy\nconst qz = cr * cp * sy - sr * sp * cy",
    typescript:
      "// 3-2-1 yaw-pitch-roll to quaternion; SI rad.\nconst cy = Math.cos(yaw / 2.0)\nconst sy = Math.sin(yaw / 2.0)\nconst cp = Math.cos(pitch / 2.0)\nconst sp = Math.sin(pitch / 2.0)\nconst cr = Math.cos(roll / 2.0)\nconst sr = Math.sin(roll / 2.0)\nconst qw = cr * cp * cy + sr * sp * sy\nconst qx = sr * cp * cy - cr * sp * sy\nconst qy = cr * sp * cy + sr * cp * sy\nconst qz = cr * cp * sy - sr * sp * cy",
    c: "/* 3-2-1 yaw-pitch-roll to quaternion; SI rad. */\nconst double cy = cos(yaw / 2.0);\nconst double sy = sin(yaw / 2.0);\nconst double cp = cos(pitch / 2.0);\nconst double sp = sin(pitch / 2.0);\nconst double cr = cos(roll / 2.0);\nconst double sr = sin(roll / 2.0);\nconst double qw = cr * cp * cy + sr * sp * sy;\nconst double qx = sr * cp * cy - cr * sp * sy;\nconst double qy = cr * sp * cy + sr * cp * sy;\nconst double qz = cr * cp * sy - sr * sp * cy;",
    cpp: "// 3-2-1 yaw-pitch-roll to quaternion; SI rad.\nconst double cy = cos(yaw / 2.0);\nconst double sy = sin(yaw / 2.0);\nconst double cp = cos(pitch / 2.0);\nconst double sp = sin(pitch / 2.0);\nconst double cr = cos(roll / 2.0);\nconst double sr = sin(roll / 2.0);\nconst double qw = cr * cp * cy + sr * sp * sy;\nconst double qx = sr * cp * cy - cr * sp * sy;\nconst double qy = cr * sp * cy + sr * cp * sy;\nconst double qz = cr * cp * sy - sr * sp * cy;",
    rust: "// 3-2-1 yaw-pitch-roll to quaternion; SI rad.\nlet cy = (yaw / 2.0_f64).cos();\nlet sy = (yaw / 2.0_f64).sin();\nlet cp = (pitch / 2.0_f64).cos();\nlet sp = (pitch / 2.0_f64).sin();\nlet cr = (roll / 2.0_f64).cos();\nlet sr = (roll / 2.0_f64).sin();\nlet qw = cr * cp * cy + sr * sp * sy;\nlet qx = sr * cp * cy - cr * sp * sy;\nlet qy = cr * sp * cy + sr * cp * sy;\nlet qz = cr * cp * sy - sr * sp * cy;",
    zig: "// 3-2-1 yaw-pitch-roll to quaternion; SI rad.\nconst cy = @cos(yaw / @as(f64, 2.0));\nconst sy = @sin(yaw / @as(f64, 2.0));\nconst cp = @cos(pitch / @as(f64, 2.0));\nconst sp = @sin(pitch / @as(f64, 2.0));\nconst cr = @cos(roll / @as(f64, 2.0));\nconst sr = @sin(roll / @as(f64, 2.0));\nconst qw = cr * cp * cy + sr * sp * sy;\nconst qx = sr * cp * cy - cr * sp * sy;\nconst qy = cr * sp * cy + sr * cp * sy;\nconst qz = cr * cp * sy - sr * sp * cy;",
    fortran:
      "! 3-2-1 yaw-pitch-roll to quaternion; SI rad.\n  cy = cos(yaw / 2.0d0)\n  sy = sin(yaw / 2.0d0)\n  cp = cos(pitch / 2.0d0)\n  sp = sin(pitch / 2.0d0)\n  cr = cos(roll / 2.0d0)\n  sr = sin(roll / 2.0d0)\n  qw = cr * cp * cy + sr * sp * sy\n  qx = sr * cp * cy - cr * sp * sy\n  qy = cr * sp * cy + sr * cp * sy\n  qz = cr * cp * sy - sr * sp * cy",
    matlab:
      "% 3-2-1 yaw-pitch-roll to quaternion; SI rad.\ncy = cos(yaw / 2.0)\nsy = sin(yaw / 2.0)\ncp = cos(pitch / 2.0)\nsp = sin(pitch / 2.0)\ncr = cos(roll / 2.0)\nsr = sin(roll / 2.0)\nqw = cr * cp * cy + sr * sp * sy\nqx = sr * cp * cy - cr * sp * sy\nqy = cr * sp * cy + sr * cp * sy\nqz = cr * cp * sy - sr * sp * cy",
    julia:
      "# 3-2-1 yaw-pitch-roll to quaternion; SI rad.\ncy = cos(yaw / 2.0)\nsy = sin(yaw / 2.0)\ncp = cos(pitch / 2.0)\nsp = sin(pitch / 2.0)\ncr = cos(roll / 2.0)\nsr = sin(roll / 2.0)\nqw = cr * cp * cy + sr * sp * sy\nqx = sr * cp * cy - cr * sp * sy\nqy = cr * sp * cy + sr * cp * sy\nqz = cr * cp * sy - sr * sp * cy",
    latex:
      "% 3-2-1 yaw-pitch-roll to quaternion; SI rad.\n\\[q=q_z(\\psi)\\otimes q_y(\\theta)\\otimes q_x(\\phi)\\]",
  },
}
