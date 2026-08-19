/*
 * Verification driver for src/lib/snippets/native/sgp4/sgp4.c.
 *
 * Walks SGP4-VER.TLE and reproduces the propagation schedule that Vallado's
 * TestSGP4.cpp used to write tcppver.out (AIAA 2006-6753), emitting one
 * machine-readable record per line for scripts/verify-native-sgp4.ts.
 *
 * Usage: native-sgp4-driver <SGP4-VER.TLE> [opsmode a|i] [grav wgs72old|wgs72|wgs84]
 *
 * Records:
 *   SAT <satnum>
 *   ROW <tsince> <x> <y> <z> <vx> <vy> <vz>      km, km/s, TEME
 *   NAN <error> <message>                         tsince 0 produced NaN
 *   ERR <error> <message>                         propagation stopped here
 *
 * MIT, distributed with SIDUS. Educational model, not flight software.
 */
#include <math.h>
#include <stdio.h>
#include <string.h>

#include "sgp4.h"

static void emit_row(double tsince, const double r[3], const double v[3]) {
  printf("ROW %.17g %.17g %.17g %.17g %.17g %.17g %.17g\n", tsince, r[0], r[1],
         r[2], v[0], v[1], v[2]);
}

int main(int argc, char **argv) {
  char line1[256], line2[256];
  FILE *fp;
  char opsmode = 'i';
  sgp4_gravmodel gravmodel = SGP4_GRAV_WGS72;
  sgp4_gravconst whichconst;

  if (argc < 2) {
    fprintf(stderr, "usage: %s <SGP4-VER.TLE> [a|i] [wgs72old|wgs72|wgs84]\n",
            argv[0]);
    return 2;
  }
  if (argc >= 3) opsmode = argv[2][0];
  if (argc >= 4) {
    if (strcmp(argv[3], "wgs72old") == 0)
      gravmodel = SGP4_GRAV_WGS72OLD;
    else if (strcmp(argv[3], "wgs84") == 0)
      gravmodel = SGP4_GRAV_WGS84;
    else
      gravmodel = SGP4_GRAV_WGS72;
  }
  whichconst = sgp4_getgravconst(gravmodel);

  fp = fopen(argv[1], "r");
  if (!fp) {
    fprintf(stderr, "cannot open %s\n", argv[1]);
    return 2;
  }

  while (fgets(line1, sizeof(line1), fp)) {
    elsetrec satrec;
    double startmfe, stopmfe, deltamin, tsince;
    double r[3], v[3];
    int e, stopped;

    if (line1[0] != '1') continue;
    if (!fgets(line2, sizeof(line2), fp)) break;

    if (sgp4_twoline2rv(line1, line2, 'v', opsmode, whichconst, &startmfe,
                        &stopmfe, &deltamin, &satrec) != 0) {
      fprintf(stderr, "TLE parse failure:\n%s%s", line1, line2);
      fclose(fp);
      return 1;
    }

    printf("SAT %ld\n", satrec.satnum);

    e = sgp4(&satrec, 0.0, r, v);
    if (isnan(r[0]) && isnan(r[1]) && isnan(r[2])) {
      printf("NAN %d %s\n", e, satrec.error_message);
      continue;
    }
    emit_row(0.0, r, v);

    stopped = 0;
    tsince = startmfe;
    while (tsince <= stopmfe) {
      if (tsince == startmfe && tsince == 0.0) {
        tsince += deltamin;
        continue;
      }
      e = sgp4(&satrec, tsince, r, v);
      if (e != 0) {
        printf("ERR %d %s\n", e, satrec.error_message);
        stopped = 1;
        break;
      }
      emit_row(tsince, r, v);
      tsince += deltamin;
    }
    if (stopped) continue;

    if (tsince - stopmfe < deltamin - 1e-6) {
      e = sgp4(&satrec, stopmfe, r, v);
      if (e != 0) {
        printf("ERR %d %s\n", e, satrec.error_message);
        continue;
      }
      emit_row(stopmfe, r, v);
    }
  }

  fclose(fp);
  return 0;
}
