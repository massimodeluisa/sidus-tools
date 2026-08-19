# Published SGP4 verification data

Verbatim copies of the SGP4/SDP4 verification files published with
Vallado, Crawford, Hujsak, Kelso, **"Revisiting Spacetrack Report #3"**,
AIAA 2006-6753.

These files are reference data, not source. They are never edited: if a port
disagrees with a number here, the port is wrong.

## Run

```bash
npx tsx scripts/verify-native-sgp4.ts
```

Compiles `src/lib/snippets/native/sgp4/sgp4.c` and asserts every row of
`tcppver.out`. Exit code 1 on any mismatch.

## Files

| File | Lines | Bytes | SHA-256 |
|------|-------|-------|---------|
| `SGP4-VER.TLE` | 110 (CRLF) | 8616 | `d246d1d9d768ace445a38a965713fa9ba52d80fd8a41a0502ff83d7acffe2881` |
| `tcppver.out` | 700 (LF) | 140162 | `687bf28dbe52df86e8e60ab5cb4a08d1aa3dbcaf4e63b1f7ab95f044fbe3833b` |

Downloaded 2026-08-19.

## Origin

`SGP4-VER.TLE` was extracted from the official AIAA distribution:

- <https://celestrak.org/publications/AIAA/2006-6753/AIAA-2006-6753.zip>
  (SHA-256 `3642043b706c76be87cf012db3f22e04da6b80498d00f515e51879e0ffadc115`)
- archive member `sgp4/cpp/testsgp4/SGP4-VER.TLE`

The archive ships three byte-identical copies of that file
(`sgp4/cpp/testsgp4/`, `sgp4/cpp/testsgp4/TestSGP4/`, `sgp4/mat/`).

`tcppver.out` is **not** present in that archive. The archive ships the
Fortran, MATLAB and Java verification outputs (`for/tforverf.out`,
`mat/tmatverDec2015.out`, `java/JAVA_SGP4_v2/java_sgp4_ver.out`) but not the
C++ one, which `TestSGP4.cpp` writes at run time. The copy here comes from
python-sgp4 (MIT, Brandon Rhodes), which redistributes the published C++
output unchanged:

- <https://raw.githubusercontent.com/brandon-rhodes/python-sgp4/master/sgp4/tcppver.out>

python-sgp4's copy of `SGP4-VER.TLE` has the same SHA-256 as the archive
member vendored here, which is the cross-check that the two sources agree.

## Contents

`SGP4-VER.TLE` holds 33 TLE pairs (satellite 20413 appears twice with
different time ranges) plus comment lines. Each line 2 carries three extra
fields after the checksum: start, stop and step in minutes from epoch. That
is Vallado's verification mode, described in `sgp4io.cpp`.

`tcppver.out` holds 33 `<satnum> xx` headers and 667 data rows: time since
epoch in minutes, then position (km) and velocity (km/s) in TEME.

Seven satellites stop early with a documented error code, in file order:

| Satellite | Code | Condition |
|-----------|------|-----------|
| 22312 | 1 | mean eccentricity -0.001329 out of range |
| 28350 | 1 | mean eccentricity -0.001208 out of range |
| 28872 | 6 | mrt 0.996159 below 1.0, decayed |
| 29141 | 6 | mrt 0.996252 below 1.0, decayed |
| 33333 | 4 | semi-latus rectum -0.103223 below zero |
| 33334 | 3 | perturbed eccentricity -122.217193 out of range |
| 20413 | 6 | mrt 0.830534 below 1.0, decayed |

Satellite 33334 fails at time 0, so its single row in `tcppver.out` repeats
the previous satellite's last data line. That is a stale output buffer in
`TestSGP4.cpp`, not a propagation result, and the harness asserts it as a
repeat rather than as physics.

## Generating conditions

`tcppver.out` was produced with **WGS-72** constants and **opsmode `i`**
(improved), not opsmode `a` (afspc). Two independent confirmations:

- python-sgp4 runs its own `tcppver.out` integration test through
  `io.twoline2rv(line1, line2, wgs72)`, whose signature defaults to
  `opsmode='i'`, and through `Satrec.twoline2rv(line1, line2)`, which
  `model.py` forwards as `twoline2rv(line1, line2, whichconst, 'i', self)`.
- Running the C port here in both modes: opsmode `i` reproduces every row to
  under 1e-4 m, while opsmode `a` moves satellite 23599 (ARIANE 42P+3 R/B,
  the AcTan Lyddane case) by up to 960 m. Only that one satellite differs;
  opsmode changes `gsto` and the `nodep < 0` branch of `dpper`.

## Transcription audit (2026-08-19)

The four satellites already used in `src/lib/physics/sgp4.test.ts` were
checked against these files. All 8 TLE lines are byte-identical and all 12
published state vectors match to the last printed digit:

| Satellite | TLE lines | Rows checked |
|-----------|-----------|--------------|
| 00005 | 3, 4 | t = 0, 360, 4320 |
| 06251 | 10, 11 | t = 0, 120, 2880 |
| 28129 | 72, 73 | t = 0, 720, 1440 |
| 24208 | 54, 55 | t = 0, 720, 1440 |

## What this is not

Educational verification data for an analytical propagator. It certifies that
an SGP4 implementation reproduces the published reference run. It does not
certify operational conjunction, reentry or ephemeris products.
