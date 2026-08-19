/*
 * SGP4/SDP4 analytical satellite propagator: self-contained C99 reference port.
 *
 * Ported by hand, function by function, from python-sgp4 by Brandon Rhodes
 * (MIT License, Copyright (c) 2012-2016 Brandon Rhodes):
 *   https://github.com/brandon-rhodes/python-sgp4
 *   sgp4/propagation.py, sgp4/io.py, sgp4/model.py, sgp4/earth_gravity.py
 *
 * python-sgp4 is itself a direct port of the companion code published with:
 *   Vallado, D. A., Crawford, P., Hujsak, R., Kelso, T. S.,
 *   "Revisiting Spacetrack Report #3", AIAA 2006-6753, AIAA/AAS Astrodynamics
 *   Specialist Conference, Keystone, CO, 2006.
 *   https://celestrak.org/publications/AIAA/2006-6753/
 *
 * The verification-mode TLE parsing (start/stop/step fields appended to line 2)
 * and the fmod() call sites follow sgp4io.cpp / sgp4unit.cpp from that AIAA
 * distribution, which is what produced the published tcppver.out vectors.
 *
 * This file is distributed under the MIT License together with SIDUS.
 * Educational model, not flight software.
 *
 * Depends only on the C standard library and libm.
 *
 * Limitation: satnum parsing is numeric (2006 C++ form); alpha-5 designators
 * are not parsed.
 */
#ifndef SIDUS_SGP4_H
#define SIDUS_SGP4_H

#ifdef __cplusplus
extern "C" {
#endif

/** Gravity model selector for sgp4_getgravconst(). */
typedef enum {
  SGP4_GRAV_WGS72OLD = 0,
  SGP4_GRAV_WGS72 = 1,
  SGP4_GRAV_WGS84 = 2
} sgp4_gravmodel;

/** Un-normalized zonal harmonics and derived Earth constants, in km and min. */
typedef struct {
  double tumin;
  double mu;
  double radiusearthkm;
  double xke;
  double j2;
  double j3;
  double j4;
  double j3oj2;
} sgp4_gravconst;

/** Complete propagator state; mirrors the `satrec` object of python-sgp4. */
typedef struct {
  long satnum;
  int epochyr;
  int ephtype;
  long elnum;
  long revnum;
  char classification;
  char intldesg[12];

  char method;        /* 'n' near earth, 'd' deep space */
  char init;          /* 'y' while sgp4init runs, 'n' afterwards */
  char operationmode; /* 'a' afspc, 'i' improved */
  int isimp;
  int error;
  char error_message[128];

  double tumin, mu, radiusearthkm, xke, j2, j3, j4, j3oj2;

  double epochdays, jdsatepoch;
  double bstar, ndot, nddot;
  double ecco, argpo, inclo, mo, nodeo;
  double no_kozai, no_unkozai;
  double a, alta, altp;

  /* near earth */
  double aycof, con41, cc1, cc4, cc5, d2, d3, d4, delmo, eta, argpdot, omgcof;
  double sinmao, t, t2cof, t3cof, t4cof, t5cof, x1mth2, x7thm1, mdot, nodedot;
  double xlcof, xmcof, nodecf;

  /* deep space */
  int irez;
  double d2201, d2211, d3210, d3222, d4410, d4422, d5220, d5232, d5421, d5433;
  double dedt, del1, del2, del3, didt, dmdt, dnodt, domdt;
  double e3, ee2, peo, pgho, pho, pinco, plo;
  double se2, se3, sgh2, sgh3, sgh4, sh2, sh3, si2, si3, sl2, sl3, sl4;
  double gsto, xfact, xgh2, xgh3, xgh4, xh2, xh3, xi2, xi3, xl2, xl3, xl4;
  double xlamo, zmol, zmos, atime, xli, xni;

  /* singly averaged mean elements recovered by the last sgp4() call */
  double am, em, im, Om, om, mm, nm;
} elsetrec;

/** Return the constant set for `which`; unknown values fall back to WGS-72. */
sgp4_gravconst sgp4_getgravconst(sgp4_gravmodel which);

/** Greenwich sidereal time in rad, 0 to 2pi, for a UT1 Julian date. */
double sgp4_gstime(double jdut1);

/** Split a day-of-year into calendar and clock fields (AIAA 2006 form). */
void sgp4_days2mdhms(int year, double days, int *mon, int *day, int *hr,
                     int *minute, double *sec);

/** Julian date from calendar and clock fields (AIAA 2006 single-value form). */
double sgp4_jday(int year, int mon, int day, int hr, int minute, double sec);

/**
 * Initialize `satrec` from mean elements. `epoch` is days since 1949 December
 * 31 00:00 UT (jdsatepoch - 2433281.5). Angles in rad, no_kozai in rad/min.
 * Returns satrec->error, which is set by the internal propagation to tsince 0.
 */
int sgp4init(sgp4_gravconst whichconst, char opsmode, long satn, double epoch,
             double xbstar, double xndot, double xnddot, double xecco,
             double xargpo, double xinclo, double xmo, double xno_kozai,
             double xnodeo, elsetrec *satrec);

/**
 * Propagate to `tsince` minutes from epoch. Position in km, velocity in km/s,
 * both in the TEME frame. Returns satrec->error:
 *   0 - ok
 *   1 - mean eccentricity out of range (r, v set to NaN)
 *   2 - mean motion below zero (r, v set to NaN)
 *   3 - perturbed eccentricity out of range (r, v set to NaN)
 *   4 - semi-latus rectum below zero (r, v set to NaN)
 *   5 - epoch elements sub-orbital (not raised; kept for numbering)
 *   6 - satellite has decayed (r, v still returned)
 */
int sgp4(elsetrec *satrec, double tsince, double r[3], double v[3]);

/**
 * Parse a TLE and initialize `satrec`.
 *
 * `typerun` 'v' additionally reads the verification start/stop/step minutes
 * appended to line 2 and stores them in `startmfe`, `stopmfe`, `deltamin`;
 * any other value leaves those at the catalog default of -1440, 1440, 10.
 * `opsmode` is 'a' (afspc) or 'i' (improved).
 *
 * Returns 0 on success or -1 if either line fails its format check.
 */
int sgp4_twoline2rv(const char *longstr1, const char *longstr2, char typerun,
                    char opsmode, sgp4_gravconst whichconst, double *startmfe,
                    double *stopmfe, double *deltamin, elsetrec *satrec);

#ifdef __cplusplus
}
#endif

#endif /* SIDUS_SGP4_H */
