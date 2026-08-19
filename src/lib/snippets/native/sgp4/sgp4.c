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
 */
#include "sgp4.h"

#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static const double sgp4_pi = 3.14159265358979323846;
static const double sgp4_twopi = 6.28318530717958647692;
static const double sgp4_deg2rad = 0.01745329251994329577;

/* Values passed to dsinit and dpper that dscom computes but satrec does not own. */
typedef struct {
  double snodm, cnodm, sinim, cosim, sinomm, cosomm;
  double day, em, emsq, gam, rtemsq;
  double s1, s2, s3, s4, s5, s6, s7;
  double ss1, ss2, ss3, ss4, ss5, ss6, ss7;
  double sz1, sz2, sz3, sz11, sz12, sz13, sz21, sz22, sz23, sz31, sz32, sz33;
  double z1, z2, z3, z11, z12, z13, z21, z22, z23, z31, z32, z33;
  double nm;
} dscom_locals;

/* ------------------------------------------------------------------ gstime */

double sgp4_gstime(double jdut1) {
  double tut1, temp;

  tut1 = (jdut1 - 2451545.0) / 36525.0;
  temp = -6.2e-6 * tut1 * tut1 * tut1 + 0.093104 * tut1 * tut1 +
         (876600.0 * 3600 + 8640184.812866) * tut1 + 67310.54841;
  temp = fmod(temp * sgp4_deg2rad / 240.0, sgp4_twopi);

  if (temp < 0.0) temp += sgp4_twopi;

  return temp;
}

/* ----------------------------------------------------------- getgravconst */

sgp4_gravconst sgp4_getgravconst(sgp4_gravmodel which) {
  sgp4_gravconst c;

  switch (which) {
    case SGP4_GRAV_WGS72OLD:
      c.mu = 398600.79964;
      c.radiusearthkm = 6378.135;
      c.xke = 0.0743669161;
      c.tumin = 1.0 / c.xke;
      c.j2 = 0.001082616;
      c.j3 = -0.00000253881;
      c.j4 = -0.00000165597;
      break;

    case SGP4_GRAV_WGS84:
      c.mu = 398600.5;
      c.radiusearthkm = 6378.137;
      c.xke = 60.0 / sqrt(c.radiusearthkm * c.radiusearthkm * c.radiusearthkm /
                          c.mu);
      c.tumin = 1.0 / c.xke;
      c.j2 = 0.00108262998905;
      c.j3 = -0.00000253215306;
      c.j4 = -0.00000161098761;
      break;

    case SGP4_GRAV_WGS72:
    default:
      c.mu = 398600.8;
      c.radiusearthkm = 6378.135;
      c.xke = 60.0 / sqrt(c.radiusearthkm * c.radiusearthkm * c.radiusearthkm /
                          c.mu);
      c.tumin = 1.0 / c.xke;
      c.j2 = 0.001082616;
      c.j3 = -0.00000253881;
      c.j4 = -0.00000165597;
      break;
  }

  c.j3oj2 = c.j3 / c.j2;
  return c;
}

/* ------------------------------------------------------------------- dpper */

static void dpper(elsetrec *satrec, double inclo, char init, double *ep,
                  double *inclp, double *nodep, double *argpp, double *mp,
                  char opsmode) {
  double e3 = satrec->e3, ee2 = satrec->ee2, peo = satrec->peo;
  double pgho = satrec->pgho, pho = satrec->pho, pinco = satrec->pinco;
  double plo = satrec->plo, se2 = satrec->se2, se3 = satrec->se3;
  double sgh2 = satrec->sgh2, sgh3 = satrec->sgh3, sgh4 = satrec->sgh4;
  double sh2 = satrec->sh2, sh3 = satrec->sh3, si2 = satrec->si2;
  double si3 = satrec->si3, sl2 = satrec->sl2, sl3 = satrec->sl3;
  double sl4 = satrec->sl4, t = satrec->t;
  double xgh2 = satrec->xgh2, xgh3 = satrec->xgh3, xgh4 = satrec->xgh4;
  double xh2 = satrec->xh2, xh3 = satrec->xh3, xi2 = satrec->xi2;
  double xi3 = satrec->xi3, xl2 = satrec->xl2, xl3 = satrec->xl3;
  double xl4 = satrec->xl4, zmol = satrec->zmol, zmos = satrec->zmos;

  double zns, zes, znl, zel;
  double zm, zf, sinzf, f2, f3;
  double ses, sis, sls, sghs, shs, sel, sil, sll, sghl, shll;
  double pe, pinc, pl, pgh, ph;
  double sinip, cosip, sinop, cosop, alfdp, betdp, dalf, dbet, xls, xnoh;

  (void)inclo; /* strn3 lyddane choice; gsfc perturbed inclination is used */

  zns = 1.19459e-5;
  zes = 0.01675;
  znl = 1.5835218e-4;
  zel = 0.05490;

  zm = zmos + zns * t;
  if (init == 'y') zm = zmos;
  zf = zm + 2.0 * zes * sin(zm);
  sinzf = sin(zf);
  f2 = 0.5 * sinzf * sinzf - 0.25;
  f3 = -0.5 * sinzf * cos(zf);
  ses = se2 * f2 + se3 * f3;
  sis = si2 * f2 + si3 * f3;
  sls = sl2 * f2 + sl3 * f3 + sl4 * sinzf;
  sghs = sgh2 * f2 + sgh3 * f3 + sgh4 * sinzf;
  shs = sh2 * f2 + sh3 * f3;
  zm = zmol + znl * t;
  if (init == 'y') zm = zmol;
  zf = zm + 2.0 * zel * sin(zm);
  sinzf = sin(zf);
  f2 = 0.5 * sinzf * sinzf - 0.25;
  f3 = -0.5 * sinzf * cos(zf);
  sel = ee2 * f2 + e3 * f3;
  sil = xi2 * f2 + xi3 * f3;
  sll = xl2 * f2 + xl3 * f3 + xl4 * sinzf;
  sghl = xgh2 * f2 + xgh3 * f3 + xgh4 * sinzf;
  shll = xh2 * f2 + xh3 * f3;
  pe = ses + sel;
  pinc = sis + sil;
  pl = sls + sll;
  pgh = sghs + sghl;
  ph = shs + shll;

  if (init == 'n') {
    pe = pe - peo;
    pinc = pinc - pinco;
    pl = pl - plo;
    pgh = pgh - pgho;
    ph = ph - pho;
    *inclp = *inclp + pinc;
    *ep = *ep + pe;
    sinip = sin(*inclp);
    cosip = cos(*inclp);

    if (*inclp >= 0.2) {
      ph /= sinip;
      pgh -= cosip * ph;
      *argpp += pgh;
      *nodep += ph;
      *mp += pl;
    } else {
      sinop = sin(*nodep);
      cosop = cos(*nodep);
      alfdp = sinip * sinop;
      betdp = sinip * cosop;
      dalf = ph * cosop + pinc * cosip * sinop;
      dbet = -ph * sinop + pinc * cosip * cosop;
      alfdp = alfdp + dalf;
      betdp = betdp + dbet;
      *nodep = fmod(*nodep, sgp4_twopi);
      if (*nodep < 0.0 && opsmode == 'a') *nodep = *nodep + sgp4_twopi;
      xls = *mp + *argpp + pl + pgh + (cosip - pinc * sinip) * (*nodep);
      xnoh = *nodep;
      *nodep = atan2(alfdp, betdp);
      if (*nodep < 0.0 && opsmode == 'a') *nodep = *nodep + sgp4_twopi;
      if (fabs(xnoh - *nodep) > sgp4_pi) {
        if (*nodep < xnoh)
          *nodep = *nodep + sgp4_twopi;
        else
          *nodep = *nodep - sgp4_twopi;
      }
      *mp += pl;
      *argpp = xls - *mp - cosip * (*nodep);
    }
  }
}

/* ------------------------------------------------------------------- dscom */

static void dscom(elsetrec *satrec, double epoch, double ep, double argpp,
                  double tc, double inclp, double nodep, double np,
                  dscom_locals *o) {
  double zes, zel, c1ss, c1l, zsinis, zcosis, zcosgs, zsings;
  double nm, em, snodm, cnodm, sinomm, cosomm, sinim, cosim, emsq, betasq,
      rtemsq;
  double day, xnodce, stem, ctem, zcosil, zsinil, zsinhl, zcoshl, gam, zx, zy,
      zcosgl, zsingl;
  double zcosg, zsing, zcosi, zsini, zcosh, zsinh, cc, xnoi;
  double a1, a2, a3, a4, a5, a6, a7, a8, a9, a10;
  double x1, x2, x3, x4, x5, x6, x7, x8;
  double z1, z2, z3, z11, z12, z13, z21, z22, z23, z31, z32, z33;
  double s1, s2, s3, s4, s5, s6, s7;
  double ss1 = 0.0, ss2 = 0.0, ss3 = 0.0, ss4 = 0.0, ss5 = 0.0, ss6 = 0.0,
         ss7 = 0.0;
  double sz1 = 0.0, sz2 = 0.0, sz3 = 0.0, sz11 = 0.0, sz12 = 0.0, sz13 = 0.0;
  double sz21 = 0.0, sz22 = 0.0, sz23 = 0.0, sz31 = 0.0, sz32 = 0.0, sz33 = 0.0;
  int lsflg;

  zes = 0.01675;
  zel = 0.05490;
  c1ss = 2.9864797e-6;
  c1l = 4.7968065e-7;
  zsinis = 0.39785416;
  zcosis = 0.91744867;
  zcosgs = 0.1945905;
  zsings = -0.98088458;

  nm = np;
  em = ep;
  snodm = sin(nodep);
  cnodm = cos(nodep);
  sinomm = sin(argpp);
  cosomm = cos(argpp);
  sinim = sin(inclp);
  cosim = cos(inclp);
  emsq = em * em;
  betasq = 1.0 - emsq;
  rtemsq = sqrt(betasq);

  satrec->peo = 0.0;
  satrec->pinco = 0.0;
  satrec->plo = 0.0;
  satrec->pgho = 0.0;
  satrec->pho = 0.0;
  day = epoch + 18261.5 + tc / 1440.0;
  xnodce = fmod(4.5236020 - 9.2422029e-4 * day, sgp4_twopi);
  stem = sin(xnodce);
  ctem = cos(xnodce);
  zcosil = 0.91375164 - 0.03568096 * ctem;
  zsinil = sqrt(1.0 - zcosil * zcosil);
  zsinhl = 0.089683511 * stem / zsinil;
  zcoshl = sqrt(1.0 - zsinhl * zsinhl);
  gam = 5.8351514 + 0.0019443680 * day;
  zx = 0.39785416 * stem / zsinil;
  zy = zcoshl * ctem + 0.91744867 * zsinhl * stem;
  zx = atan2(zx, zy);
  zx = gam + zx - xnodce;
  zcosgl = cos(zx);
  zsingl = sin(zx);

  zcosg = zcosgs;
  zsing = zsings;
  zcosi = zcosis;
  zsini = zsinis;
  zcosh = cnodm;
  zsinh = snodm;
  cc = c1ss;
  xnoi = 1.0 / nm;

  s1 = s2 = s3 = s4 = s5 = s6 = s7 = 0.0;
  z1 = z2 = z3 = z11 = z12 = z13 = z21 = z22 = z23 = z31 = z32 = z33 = 0.0;

  for (lsflg = 1; lsflg <= 2; lsflg++) {
    a1 = zcosg * zcosh + zsing * zcosi * zsinh;
    a3 = -zsing * zcosh + zcosg * zcosi * zsinh;
    a7 = -zcosg * zsinh + zsing * zcosi * zcosh;
    a8 = zsing * zsini;
    a9 = zsing * zsinh + zcosg * zcosi * zcosh;
    a10 = zcosg * zsini;
    a2 = cosim * a7 + sinim * a8;
    a4 = cosim * a9 + sinim * a10;
    a5 = -sinim * a7 + cosim * a8;
    a6 = -sinim * a9 + cosim * a10;

    x1 = a1 * cosomm + a2 * sinomm;
    x2 = a3 * cosomm + a4 * sinomm;
    x3 = -a1 * sinomm + a2 * cosomm;
    x4 = -a3 * sinomm + a4 * cosomm;
    x5 = a5 * sinomm;
    x6 = a6 * sinomm;
    x7 = a5 * cosomm;
    x8 = a6 * cosomm;

    z31 = 12.0 * x1 * x1 - 3.0 * x3 * x3;
    z32 = 24.0 * x1 * x2 - 6.0 * x3 * x4;
    z33 = 12.0 * x2 * x2 - 3.0 * x4 * x4;
    z1 = 3.0 * (a1 * a1 + a2 * a2) + z31 * emsq;
    z2 = 6.0 * (a1 * a3 + a2 * a4) + z32 * emsq;
    z3 = 3.0 * (a3 * a3 + a4 * a4) + z33 * emsq;
    z11 = -6.0 * a1 * a5 + emsq * (-24.0 * x1 * x7 - 6.0 * x3 * x5);
    z12 = -6.0 * (a1 * a6 + a3 * a5) +
          emsq * (-24.0 * (x2 * x7 + x1 * x8) - 6.0 * (x3 * x6 + x4 * x5));
    z13 = -6.0 * a3 * a6 + emsq * (-24.0 * x2 * x8 - 6.0 * x4 * x6);
    z21 = 6.0 * a2 * a5 + emsq * (24.0 * x1 * x5 - 6.0 * x3 * x7);
    z22 = 6.0 * (a4 * a5 + a2 * a6) +
          emsq * (24.0 * (x2 * x5 + x1 * x6) - 6.0 * (x4 * x7 + x3 * x8));
    z23 = 6.0 * a4 * a6 + emsq * (24.0 * x2 * x6 - 6.0 * x4 * x8);
    z1 = z1 + z1 + betasq * z31;
    z2 = z2 + z2 + betasq * z32;
    z3 = z3 + z3 + betasq * z33;
    s3 = cc * xnoi;
    s2 = -0.5 * s3 / rtemsq;
    s4 = s3 * rtemsq;
    s1 = -15.0 * em * s4;
    s5 = x1 * x3 + x2 * x4;
    s6 = x2 * x3 + x1 * x4;
    s7 = x2 * x4 - x1 * x3;

    if (lsflg == 1) {
      ss1 = s1;
      ss2 = s2;
      ss3 = s3;
      ss4 = s4;
      ss5 = s5;
      ss6 = s6;
      ss7 = s7;
      sz1 = z1;
      sz2 = z2;
      sz3 = z3;
      sz11 = z11;
      sz12 = z12;
      sz13 = z13;
      sz21 = z21;
      sz22 = z22;
      sz23 = z23;
      sz31 = z31;
      sz32 = z32;
      sz33 = z33;
      zcosg = zcosgl;
      zsing = zsingl;
      zcosi = zcosil;
      zsini = zsinil;
      zcosh = zcoshl * cnodm + zsinhl * snodm;
      zsinh = snodm * zcoshl - cnodm * zsinhl;
      cc = c1l;
    }
  }

  satrec->zmol = fmod(4.7199672 + 0.22997150 * day - gam, sgp4_twopi);
  satrec->zmos = fmod(6.2565837 + 0.017201977 * day, sgp4_twopi);

  satrec->se2 = 2.0 * ss1 * ss6;
  satrec->se3 = 2.0 * ss1 * ss7;
  satrec->si2 = 2.0 * ss2 * sz12;
  satrec->si3 = 2.0 * ss2 * (sz13 - sz11);
  satrec->sl2 = -2.0 * ss3 * sz2;
  satrec->sl3 = -2.0 * ss3 * (sz3 - sz1);
  satrec->sl4 = -2.0 * ss3 * (-21.0 - 9.0 * emsq) * zes;
  satrec->sgh2 = 2.0 * ss4 * sz32;
  satrec->sgh3 = 2.0 * ss4 * (sz33 - sz31);
  satrec->sgh4 = -18.0 * ss4 * zes;
  satrec->sh2 = -2.0 * ss2 * sz22;
  satrec->sh3 = -2.0 * ss2 * (sz23 - sz21);

  satrec->ee2 = 2.0 * s1 * s6;
  satrec->e3 = 2.0 * s1 * s7;
  satrec->xi2 = 2.0 * s2 * z12;
  satrec->xi3 = 2.0 * s2 * (z13 - z11);
  satrec->xl2 = -2.0 * s3 * z2;
  satrec->xl3 = -2.0 * s3 * (z3 - z1);
  satrec->xl4 = -2.0 * s3 * (-21.0 - 9.0 * emsq) * zel;
  satrec->xgh2 = 2.0 * s4 * z32;
  satrec->xgh3 = 2.0 * s4 * (z33 - z31);
  satrec->xgh4 = -18.0 * s4 * zel;
  satrec->xh2 = -2.0 * s2 * z22;
  satrec->xh3 = -2.0 * s2 * (z23 - z21);

  o->snodm = snodm;
  o->cnodm = cnodm;
  o->sinim = sinim;
  o->cosim = cosim;
  o->sinomm = sinomm;
  o->cosomm = cosomm;
  o->day = day;
  o->em = em;
  o->emsq = emsq;
  o->gam = gam;
  o->rtemsq = rtemsq;
  o->s1 = s1;
  o->s2 = s2;
  o->s3 = s3;
  o->s4 = s4;
  o->s5 = s5;
  o->s6 = s6;
  o->s7 = s7;
  o->ss1 = ss1;
  o->ss2 = ss2;
  o->ss3 = ss3;
  o->ss4 = ss4;
  o->ss5 = ss5;
  o->ss6 = ss6;
  o->ss7 = ss7;
  o->sz1 = sz1;
  o->sz2 = sz2;
  o->sz3 = sz3;
  o->sz11 = sz11;
  o->sz12 = sz12;
  o->sz13 = sz13;
  o->sz21 = sz21;
  o->sz22 = sz22;
  o->sz23 = sz23;
  o->sz31 = sz31;
  o->sz32 = sz32;
  o->sz33 = sz33;
  o->z1 = z1;
  o->z2 = z2;
  o->z3 = z3;
  o->z11 = z11;
  o->z12 = z12;
  o->z13 = z13;
  o->z21 = z21;
  o->z22 = z22;
  o->z23 = z23;
  o->z31 = z31;
  o->z32 = z32;
  o->z33 = z33;
  o->nm = nm;
}

/* ------------------------------------------------------------------ dsinit */

static void dsinit(elsetrec *satrec, double xke, double cosim, double emsq,
                   double argpo, double s1, double s2, double s3, double s4,
                   double s5, double sinim, double ss1, double ss2, double ss3,
                   double ss4, double ss5, double sz1, double sz3, double sz11,
                   double sz13, double sz21, double sz23, double sz31,
                   double sz33, double t, double tc, double gsto, double mo,
                   double mdot, double no, double nodeo, double nodedot,
                   double xpidot, double z1, double z3, double z11, double z13,
                   double z21, double z23, double z31, double z33, double ecco,
                   double eccsq, double *em, double *argpm, double *inclm,
                   double *mm, double *nm, double *nodem, double *dndt) {
  double q22, q31, q33, root22, root44, root54, rptim, root32, root52, x2o3,
      znl, zns;
  double ses, sis, sls, sghs, shs, sghl, shll, sgs;
  double theta, aonv = 0.0, cosisq, emo, emsqo, eoc;
  double g200, g201, g211, g300, g310, g322, g410, g422, g520, g521, g532, g533;
  double f220, f221, f311, f321, f322, f330, f441, f442, f522, f523, f542, f543;
  double sini2, xno2, ainv2, temp, temp1;

  q22 = 1.7891679e-6;
  q31 = 2.1460748e-6;
  q33 = 2.2123015e-7;
  root22 = 1.7891679e-6;
  root44 = 7.3636953e-9;
  root54 = 2.1765803e-9;
  rptim = 4.37526908801129966e-3;
  root32 = 3.7393792e-7;
  root52 = 1.1428639e-7;
  x2o3 = 2.0 / 3.0;
  znl = 1.5835218e-4;
  zns = 1.19459e-5;

  satrec->irez = 0;
  if (*nm > 0.0034906585 && *nm < 0.0052359877) satrec->irez = 1;
  if (*nm >= 8.26e-3 && *nm <= 9.24e-3 && *em >= 0.5) satrec->irez = 2;

  ses = ss1 * zns * ss5;
  sis = ss2 * zns * (sz11 + sz13);
  sls = -zns * ss3 * (sz1 + sz3 - 14.0 - 6.0 * emsq);
  sghs = ss4 * zns * (sz31 + sz33 - 6.0);
  shs = -zns * ss2 * (sz21 + sz23);
  if (*inclm < 5.2359877e-2 || *inclm > sgp4_pi - 5.2359877e-2) shs = 0.0;
  if (sinim != 0.0) shs = shs / sinim;
  sgs = sghs - cosim * shs;

  satrec->dedt = ses + s1 * znl * s5;
  satrec->didt = sis + s2 * znl * (z11 + z13);
  satrec->dmdt = sls - znl * s3 * (z1 + z3 - 14.0 - 6.0 * emsq);
  sghl = s4 * znl * (z31 + z33 - 6.0);
  shll = -znl * s2 * (z21 + z23);
  if (*inclm < 5.2359877e-2 || *inclm > sgp4_pi - 5.2359877e-2) shll = 0.0;
  satrec->domdt = sgs + sghl;
  satrec->dnodt = shs;
  if (sinim != 0.0) {
    satrec->domdt = satrec->domdt - cosim / sinim * shll;
    satrec->dnodt = satrec->dnodt + shll / sinim;
  }

  *dndt = 0.0;
  theta = fmod(gsto + tc * rptim, sgp4_twopi);
  *em = *em + satrec->dedt * t;
  *inclm = *inclm + satrec->didt * t;
  *argpm = *argpm + satrec->domdt * t;
  *nodem = *nodem + satrec->dnodt * t;
  *mm = *mm + satrec->dmdt * t;

  if (satrec->irez != 0) {
    aonv = pow(*nm / xke, x2o3);

    if (satrec->irez == 2) {
      cosisq = cosim * cosim;
      emo = *em;
      *em = ecco;
      emsqo = emsq;
      emsq = eccsq;
      eoc = *em * emsq;
      g201 = -0.306 - (*em - 0.64) * 0.440;

      if (*em <= 0.65) {
        g211 = 3.616 - 13.2470 * (*em) + 16.2900 * emsq;
        g310 = -19.302 + 117.3900 * (*em) - 228.4190 * emsq + 156.5910 * eoc;
        g322 = -18.9068 + 109.7927 * (*em) - 214.6334 * emsq + 146.5816 * eoc;
        g410 = -41.122 + 242.6940 * (*em) - 471.0940 * emsq + 313.9530 * eoc;
        g422 = -146.407 + 841.8800 * (*em) - 1629.014 * emsq + 1083.4350 * eoc;
        g520 = -532.114 + 3017.977 * (*em) - 5740.032 * emsq + 3708.2760 * eoc;
      } else {
        g211 = -72.099 + 331.819 * (*em) - 508.738 * emsq + 266.724 * eoc;
        g310 = -346.844 + 1582.851 * (*em) - 2415.925 * emsq + 1246.113 * eoc;
        g322 = -342.585 + 1554.908 * (*em) - 2366.899 * emsq + 1215.972 * eoc;
        g410 = -1052.797 + 4758.686 * (*em) - 7193.992 * emsq + 3651.957 * eoc;
        g422 =
            -3581.690 + 16178.110 * (*em) - 24462.770 * emsq + 12422.520 * eoc;
        if (*em > 0.715)
          g520 = -5149.66 + 29936.92 * (*em) - 54087.36 * emsq + 31324.56 * eoc;
        else
          g520 = 1464.74 - 4664.75 * (*em) + 3763.64 * emsq;
      }

      if (*em < 0.7) {
        g533 = -919.22770 + 4988.6100 * (*em) - 9064.7700 * emsq + 5542.21 * eoc;
        g521 =
            -822.71072 + 4568.6173 * (*em) - 8491.4146 * emsq + 5337.524 * eoc;
        g532 = -853.66600 + 4690.2500 * (*em) - 8624.7700 * emsq + 5341.4 * eoc;
      } else {
        g533 =
            -37995.780 + 161616.52 * (*em) - 229838.20 * emsq + 109377.94 * eoc;
        g521 =
            -51752.104 + 218913.95 * (*em) - 309468.16 * emsq + 146349.42 * eoc;
        g532 =
            -40023.880 + 170470.89 * (*em) - 242699.48 * emsq + 115605.82 * eoc;
      }

      sini2 = sinim * sinim;
      f220 = 0.75 * (1.0 + 2.0 * cosim + cosisq);
      f221 = 1.5 * sini2;
      f321 = 1.875 * sinim * (1.0 - 2.0 * cosim - 3.0 * cosisq);
      f322 = -1.875 * sinim * (1.0 + 2.0 * cosim - 3.0 * cosisq);
      f441 = 35.0 * sini2 * f220;
      f442 = 39.3750 * sini2 * sini2;
      f522 = 9.84375 * sinim *
             (sini2 * (1.0 - 2.0 * cosim - 5.0 * cosisq) +
              0.33333333 * (-2.0 + 4.0 * cosim + 6.0 * cosisq));
      f523 = sinim * (4.92187512 * sini2 * (-2.0 - 4.0 * cosim +
                                            10.0 * cosisq) +
                      6.56250012 * (1.0 + 2.0 * cosim - 3.0 * cosisq));
      f542 = 29.53125 * sinim *
             (2.0 - 8.0 * cosim +
              cosisq * (-12.0 + 8.0 * cosim + 10.0 * cosisq));
      f543 = 29.53125 * sinim *
             (-2.0 - 8.0 * cosim + cosisq * (12.0 + 8.0 * cosim -
                                             10.0 * cosisq));
      xno2 = *nm * *nm;
      ainv2 = aonv * aonv;
      temp1 = 3.0 * xno2 * ainv2;
      temp = temp1 * root22;
      satrec->d2201 = temp * f220 * g201;
      satrec->d2211 = temp * f221 * g211;
      temp1 = temp1 * aonv;
      temp = temp1 * root32;
      satrec->d3210 = temp * f321 * g310;
      satrec->d3222 = temp * f322 * g322;
      temp1 = temp1 * aonv;
      temp = 2.0 * temp1 * root44;
      satrec->d4410 = temp * f441 * g410;
      satrec->d4422 = temp * f442 * g422;
      temp1 = temp1 * aonv;
      temp = temp1 * root52;
      satrec->d5220 = temp * f522 * g520;
      satrec->d5232 = temp * f523 * g532;
      temp = 2.0 * temp1 * root54;
      satrec->d5421 = temp * f542 * g521;
      satrec->d5433 = temp * f543 * g533;
      satrec->xlamo = fmod(mo + nodeo + nodeo - theta - theta, sgp4_twopi);
      satrec->xfact = mdot + satrec->dmdt +
                      2.0 * (nodedot + satrec->dnodt - rptim) - no;
      *em = emo;
      emsq = emsqo;
    }

    if (satrec->irez == 1) {
      g200 = 1.0 + emsq * (-2.5 + 0.8125 * emsq);
      g310 = 1.0 + 2.0 * emsq;
      g300 = 1.0 + emsq * (-6.0 + 6.60937 * emsq);
      f220 = 0.75 * (1.0 + cosim) * (1.0 + cosim);
      f311 = 0.9375 * sinim * sinim * (1.0 + 3.0 * cosim) - 0.75 * (1.0 + cosim);
      f330 = 1.0 + cosim;
      f330 = 1.875 * f330 * f330 * f330;
      satrec->del1 = 3.0 * *nm * *nm * aonv * aonv;
      satrec->del2 = 2.0 * satrec->del1 * f220 * g200 * q22;
      satrec->del3 = 3.0 * satrec->del1 * f330 * g300 * q33 * aonv;
      satrec->del1 = satrec->del1 * f311 * g310 * q31 * aonv;
      satrec->xlamo = fmod(mo + nodeo + argpo - theta, sgp4_twopi);
      satrec->xfact = mdot + xpidot - rptim + satrec->dmdt + satrec->domdt +
                      satrec->dnodt - no;
    }

    satrec->xli = satrec->xlamo;
    satrec->xni = no;
    satrec->atime = 0.0;
    *nm = no + *dndt;
  }
}

/* ------------------------------------------------------------------ dspace */

static void dspace(elsetrec *satrec, double argpo, double argpdot, double t,
                   double tc, double gsto, double xfact, double xlamo,
                   double no, double *atime, double *em, double *argpm,
                   double *inclm, double *xli, double *mm, double *xni,
                   double *nodem, double *dndt, double *nm) {
  double fasx2, fasx4, fasx6, g22, g32, g44, g52, g54, rptim, stepp, stepn,
      step2;
  double theta, ft, delt = 0.0;
  double xndt = 0.0, xldot = 0.0, xnddt = 0.0, xomi, x2omi, x2li, xl;
  int iretn;

  fasx2 = 0.13130908;
  fasx4 = 2.8843198;
  fasx6 = 0.37448087;
  g22 = 5.7686396;
  g32 = 0.95240898;
  g44 = 1.8014998;
  g52 = 1.0508330;
  g54 = 4.4108898;
  rptim = 4.37526908801129966e-3;
  stepp = 720.0;
  stepn = -720.0;
  step2 = 259200.0;

  *dndt = 0.0;
  theta = fmod(gsto + tc * rptim, sgp4_twopi);
  *em = *em + satrec->dedt * t;

  *inclm = *inclm + satrec->didt * t;
  *argpm = *argpm + satrec->domdt * t;
  *nodem = *nodem + satrec->dnodt * t;
  *mm = *mm + satrec->dmdt * t;

  ft = 0.0;
  if (satrec->irez != 0) {
    if (*atime == 0.0 || t * (*atime) <= 0.0 || fabs(t) < fabs(*atime)) {
      *atime = 0.0;
      *xni = no;
      *xli = xlamo;
    }

    if (t > 0.0)
      delt = stepp;
    else
      delt = stepn;

    iretn = 381;
    while (iretn == 381) {
      if (satrec->irez != 2) {
        xndt = satrec->del1 * sin(*xli - fasx2) +
               satrec->del2 * sin(2.0 * (*xli - fasx4)) +
               satrec->del3 * sin(3.0 * (*xli - fasx6));
        xldot = *xni + xfact;
        xnddt = satrec->del1 * cos(*xli - fasx2) +
                2.0 * satrec->del2 * cos(2.0 * (*xli - fasx4)) +
                3.0 * satrec->del3 * cos(3.0 * (*xli - fasx6));
        xnddt = xnddt * xldot;
      } else {
        xomi = argpo + argpdot * (*atime);
        x2omi = xomi + xomi;
        x2li = *xli + *xli;
        xndt = (satrec->d2201 * sin(x2omi + *xli - g22) +
                satrec->d2211 * sin(*xli - g22) +
                satrec->d3210 * sin(xomi + *xli - g32) +
                satrec->d3222 * sin(-xomi + *xli - g32) +
                satrec->d4410 * sin(x2omi + x2li - g44) +
                satrec->d4422 * sin(x2li - g44) +
                satrec->d5220 * sin(xomi + *xli - g52) +
                satrec->d5232 * sin(-xomi + *xli - g52) +
                satrec->d5421 * sin(xomi + x2li - g54) +
                satrec->d5433 * sin(-xomi + x2li - g54));
        xldot = *xni + xfact;
        xnddt = (satrec->d2201 * cos(x2omi + *xli - g22) +
                 satrec->d2211 * cos(*xli - g22) +
                 satrec->d3210 * cos(xomi + *xli - g32) +
                 satrec->d3222 * cos(-xomi + *xli - g32) +
                 satrec->d5220 * cos(xomi + *xli - g52) +
                 satrec->d5232 * cos(-xomi + *xli - g52) +
                 2.0 * (satrec->d4410 * cos(x2omi + x2li - g44) +
                        satrec->d4422 * cos(x2li - g44) +
                        satrec->d5421 * cos(xomi + x2li - g54) +
                        satrec->d5433 * cos(-xomi + x2li - g54)));
        xnddt = xnddt * xldot;
      }

      if (fabs(t - *atime) >= stepp) {
        iretn = 381;
      } else {
        ft = t - *atime;
        iretn = 0;
      }

      if (iretn == 381) {
        *xli = *xli + xldot * delt + xndt * step2;
        *xni = *xni + xndt * delt + xnddt * step2;
        *atime = *atime + delt;
      }
    }

    *nm = *xni + xndt * ft + xnddt * ft * ft * 0.5;
    xl = *xli + xldot * ft + xndt * ft * ft * 0.5;
    if (satrec->irez != 1) {
      *mm = xl - 2.0 * (*nodem) + 2.0 * theta;
      *dndt = *nm - no;
    } else {
      *mm = xl - *nodem - *argpm + theta;
      *dndt = *nm - no;
    }

    *nm = no + *dndt;
  }
}

/* ------------------------------------------------------------------- initl */

static void initl(double xke, double j2, double ecco, double epoch,
                  double inclo, double *no, char *method, char opsmode,
                  double *ainv, double *ao, double *con41, double *con42,
                  double *cosio, double *cosio2, double *eccsq, double *omeosq,
                  double *posq, double *rp, double *rteosq, double *sinio,
                  double *gsto) {
  double x2o3, rteosq_, ak, d1, del_, adel, po;
  double ts70, ds70, tfrac, c1, thgr70, fk5r, c1p2p;

  x2o3 = 2.0 / 3.0;

  *eccsq = ecco * ecco;
  *omeosq = 1.0 - *eccsq;
  rteosq_ = sqrt(*omeosq);
  *rteosq = rteosq_;
  *cosio = cos(inclo);
  *cosio2 = *cosio * *cosio;

  ak = pow(xke / *no, x2o3);
  d1 = 0.75 * j2 * (3.0 * *cosio2 - 1.0) / (rteosq_ * *omeosq);
  del_ = d1 / (ak * ak);
  adel = ak * (1.0 - del_ * del_ -
               del_ * (1.0 / 3.0 + 134.0 * del_ * del_ / 81.0));
  del_ = d1 / (adel * adel);
  *no = *no / (1.0 + del_);

  *ao = pow(xke / *no, x2o3);
  *sinio = sin(inclo);
  po = *ao * *omeosq;
  *con42 = 1.0 - 5.0 * *cosio2;
  *con41 = -*con42 - *cosio2 - *cosio2;
  *ainv = 1.0 / *ao;
  *posq = po * po;
  *rp = *ao * (1.0 - ecco);
  *method = 'n';

  if (opsmode == 'a') {
    ts70 = epoch - 7305.0;
    ds70 = floor(ts70 + 1.0e-8);
    tfrac = ts70 - ds70;
    c1 = 1.72027916940703639e-2;
    thgr70 = 1.7321343856509374;
    fk5r = 5.07551419432269442e-15;
    c1p2p = c1 + sgp4_twopi;
    *gsto = fmod(thgr70 + c1 * ds70 + c1p2p * tfrac + ts70 * ts70 * fk5r,
                 sgp4_twopi);
    if (*gsto < 0.0) *gsto = *gsto + sgp4_twopi;
  } else {
    *gsto = sgp4_gstime(epoch + 2433281.5);
  }
}

/* ---------------------------------------------------------------- sgp4init */

int sgp4init(sgp4_gravconst whichconst, char opsmode, long satn, double epoch,
             double xbstar, double xndot, double xnddot, double xecco,
             double xargpo, double xinclo, double xmo, double xno_kozai,
             double xnodeo, elsetrec *satrec) {
  double temp4, ss, qzms2ttemp, qzms2t, x2o3;
  double ainv, ao, con42, cosio, cosio2, eccsq, omeosq, posq, rp, rteosq, sinio;
  double sfour, qzms24, perige, qzms24temp, pinvsq, tsi, etasq, eeta, psisq,
      coef, coef1, cc2, cc3, cosio4, temp1, temp2, temp3, xhdot1, xpidot,
      delmotemp, cc1sq, temp;
  double tc, inclm, em, emsq, argpm, nodem, mm, nm, dndt;
  char method;
  double r[3], v[3];
  dscom_locals dsc;

  temp4 = 1.5e-12;

  satrec->isimp = 0;
  satrec->method = 'n';
  satrec->aycof = 0.0;
  satrec->con41 = 0.0;
  satrec->cc1 = 0.0;
  satrec->cc4 = 0.0;
  satrec->cc5 = 0.0;
  satrec->d2 = 0.0;
  satrec->d3 = 0.0;
  satrec->d4 = 0.0;
  satrec->delmo = 0.0;
  satrec->eta = 0.0;
  satrec->argpdot = 0.0;
  satrec->omgcof = 0.0;
  satrec->sinmao = 0.0;
  satrec->t = 0.0;
  satrec->t2cof = 0.0;
  satrec->t3cof = 0.0;
  satrec->t4cof = 0.0;
  satrec->t5cof = 0.0;
  satrec->x1mth2 = 0.0;
  satrec->x7thm1 = 0.0;
  satrec->mdot = 0.0;
  satrec->nodedot = 0.0;
  satrec->xlcof = 0.0;
  satrec->xmcof = 0.0;
  satrec->nodecf = 0.0;

  satrec->irez = 0;
  satrec->d2201 = 0.0;
  satrec->d2211 = 0.0;
  satrec->d3210 = 0.0;
  satrec->d3222 = 0.0;
  satrec->d4410 = 0.0;
  satrec->d4422 = 0.0;
  satrec->d5220 = 0.0;
  satrec->d5232 = 0.0;
  satrec->d5421 = 0.0;
  satrec->d5433 = 0.0;
  satrec->dedt = 0.0;
  satrec->del1 = 0.0;
  satrec->del2 = 0.0;
  satrec->del3 = 0.0;
  satrec->didt = 0.0;
  satrec->dmdt = 0.0;
  satrec->dnodt = 0.0;
  satrec->domdt = 0.0;
  satrec->e3 = 0.0;
  satrec->ee2 = 0.0;
  satrec->peo = 0.0;
  satrec->pgho = 0.0;
  satrec->pho = 0.0;
  satrec->pinco = 0.0;
  satrec->plo = 0.0;
  satrec->se2 = 0.0;
  satrec->se3 = 0.0;
  satrec->sgh2 = 0.0;
  satrec->sgh3 = 0.0;
  satrec->sgh4 = 0.0;
  satrec->sh2 = 0.0;
  satrec->sh3 = 0.0;
  satrec->si2 = 0.0;
  satrec->si3 = 0.0;
  satrec->sl2 = 0.0;
  satrec->sl3 = 0.0;
  satrec->sl4 = 0.0;
  satrec->gsto = 0.0;
  satrec->xfact = 0.0;
  satrec->xgh2 = 0.0;
  satrec->xgh3 = 0.0;
  satrec->xgh4 = 0.0;
  satrec->xh2 = 0.0;
  satrec->xh3 = 0.0;
  satrec->xi2 = 0.0;
  satrec->xi3 = 0.0;
  satrec->xl2 = 0.0;
  satrec->xl3 = 0.0;
  satrec->xl4 = 0.0;
  satrec->xlamo = 0.0;
  satrec->zmol = 0.0;
  satrec->zmos = 0.0;
  satrec->atime = 0.0;
  satrec->xli = 0.0;
  satrec->xni = 0.0;

  satrec->tumin = whichconst.tumin;
  satrec->mu = whichconst.mu;
  satrec->radiusearthkm = whichconst.radiusearthkm;
  satrec->xke = whichconst.xke;
  satrec->j2 = whichconst.j2;
  satrec->j3 = whichconst.j3;
  satrec->j4 = whichconst.j4;
  satrec->j3oj2 = whichconst.j3oj2;

  satrec->error = 0;
  satrec->error_message[0] = '\0';
  satrec->operationmode = opsmode;
  satrec->satnum = satn;

  satrec->bstar = xbstar;
  satrec->ndot = xndot;
  satrec->nddot = xnddot;
  satrec->ecco = xecco;
  satrec->argpo = xargpo;
  satrec->inclo = xinclo;
  satrec->mo = xmo;
  satrec->no_kozai = xno_kozai;
  satrec->nodeo = xnodeo;

  satrec->am = 0.0;
  satrec->em = 0.0;
  satrec->im = 0.0;
  satrec->Om = 0.0;
  satrec->om = 0.0;
  satrec->mm = 0.0;
  satrec->nm = 0.0;

  ss = 78.0 / satrec->radiusearthkm + 1.0;
  qzms2ttemp = (120.0 - 78.0) / satrec->radiusearthkm;
  qzms2t = qzms2ttemp * qzms2ttemp * qzms2ttemp * qzms2ttemp;
  x2o3 = 2.0 / 3.0;

  satrec->init = 'y';
  satrec->t = 0.0;

  method = satrec->method;
  satrec->no_unkozai = satrec->no_kozai;
  initl(satrec->xke, satrec->j2, satrec->ecco, epoch, satrec->inclo,
        &satrec->no_unkozai, &method, satrec->operationmode, &ainv, &ao,
        &satrec->con41, &con42, &cosio, &cosio2, &eccsq, &omeosq, &posq, &rp,
        &rteosq, &sinio, &satrec->gsto);

  satrec->a = pow(satrec->no_unkozai * satrec->tumin, -2.0 / 3.0);
  satrec->alta = satrec->a * (1.0 + satrec->ecco) - 1.0;
  satrec->altp = satrec->a * (1.0 - satrec->ecco) - 1.0;

  sfour = ss;
  qzms24 = qzms2t;
  tsi = 0.0;

  if (omeosq >= 0.0 || satrec->no_unkozai >= 0.0) {
    satrec->isimp = 0;
    if (rp < 220.0 / satrec->radiusearthkm + 1.0) satrec->isimp = 1;
    sfour = ss;
    qzms24 = qzms2t;
    perige = (rp - 1.0) * satrec->radiusearthkm;

    if (perige < 156.0) {
      sfour = perige - 78.0;
      if (perige < 98.0) sfour = 20.0;
      qzms24temp = (120.0 - sfour) / satrec->radiusearthkm;
      qzms24 = qzms24temp * qzms24temp * qzms24temp * qzms24temp;
      sfour = sfour / satrec->radiusearthkm + 1.0;
    }

    pinvsq = 1.0 / posq;

    tsi = 1.0 / (ao - sfour);
    satrec->eta = ao * satrec->ecco * tsi;
    etasq = satrec->eta * satrec->eta;
    eeta = satrec->ecco * satrec->eta;
    psisq = fabs(1.0 - etasq);
    coef = qzms24 * pow(tsi, 4.0);
    coef1 = coef / pow(psisq, 3.5);
    cc2 = coef1 * satrec->no_unkozai *
          (ao * (1.0 + 1.5 * etasq + eeta * (4.0 + etasq)) +
           0.375 * satrec->j2 * tsi / psisq * satrec->con41 *
               (8.0 + 3.0 * etasq * (8.0 + etasq)));
    satrec->cc1 = satrec->bstar * cc2;
    cc3 = 0.0;
    if (satrec->ecco > 1.0e-4)
      cc3 = -2.0 * coef * tsi * satrec->j3oj2 * satrec->no_unkozai * sinio /
            satrec->ecco;
    satrec->x1mth2 = 1.0 - cosio2;
    satrec->cc4 =
        2.0 * satrec->no_unkozai * coef1 * ao * omeosq *
        (satrec->eta * (2.0 + 0.5 * etasq) + satrec->ecco * (0.5 + 2.0 * etasq) -
         satrec->j2 * tsi / (ao * psisq) *
             (-3.0 * satrec->con41 *
                  (1.0 - 2.0 * eeta + etasq * (1.5 - 0.5 * eeta)) +
              0.75 * satrec->x1mth2 * (2.0 * etasq - eeta * (1.0 + etasq)) *
                  cos(2.0 * satrec->argpo)));
    satrec->cc5 =
        2.0 * coef1 * ao * omeosq * (1.0 + 2.75 * (etasq + eeta) + eeta * etasq);
    cosio4 = cosio2 * cosio2;
    temp1 = 1.5 * satrec->j2 * pinvsq * satrec->no_unkozai;
    temp2 = 0.5 * temp1 * satrec->j2 * pinvsq;
    temp3 = -0.46875 * satrec->j4 * pinvsq * pinvsq * satrec->no_unkozai;
    satrec->mdot = satrec->no_unkozai + 0.5 * temp1 * rteosq * satrec->con41 +
                   0.0625 * temp2 * rteosq *
                       (13.0 - 78.0 * cosio2 + 137.0 * cosio4);
    satrec->argpdot = (-0.5 * temp1 * con42 +
                       0.0625 * temp2 * (7.0 - 114.0 * cosio2 + 395.0 * cosio4) +
                       temp3 * (3.0 - 36.0 * cosio2 + 49.0 * cosio4));
    xhdot1 = -temp1 * cosio;
    satrec->nodedot = xhdot1 + (0.5 * temp2 * (4.0 - 19.0 * cosio2) +
                                2.0 * temp3 * (3.0 - 7.0 * cosio2)) *
                                   cosio;
    xpidot = satrec->argpdot + satrec->nodedot;
    satrec->omgcof = satrec->bstar * cc3 * cos(satrec->argpo);
    satrec->xmcof = 0.0;
    if (satrec->ecco > 1.0e-4)
      satrec->xmcof = -x2o3 * coef * satrec->bstar / eeta;
    satrec->nodecf = 3.5 * omeosq * xhdot1 * satrec->cc1;
    satrec->t2cof = 1.5 * satrec->cc1;
    if (fabs(cosio + 1.0) > 1.5e-12)
      satrec->xlcof =
          -0.25 * satrec->j3oj2 * sinio * (3.0 + 5.0 * cosio) / (1.0 + cosio);
    else
      satrec->xlcof =
          -0.25 * satrec->j3oj2 * sinio * (3.0 + 5.0 * cosio) / temp4;
    satrec->aycof = -0.5 * satrec->j3oj2 * sinio;
    delmotemp = 1.0 + satrec->eta * cos(satrec->mo);
    satrec->delmo = delmotemp * delmotemp * delmotemp;
    satrec->sinmao = sin(satrec->mo);
    satrec->x7thm1 = 7.0 * cosio2 - 1.0;

    if (2 * sgp4_pi / satrec->no_unkozai >= 225.0) {
      satrec->method = 'd';
      satrec->isimp = 1;
      tc = 0.0;
      inclm = satrec->inclo;

      dscom(satrec, epoch, satrec->ecco, satrec->argpo, tc, satrec->inclo,
            satrec->nodeo, satrec->no_unkozai, &dsc);
      em = dsc.em;
      emsq = dsc.emsq;
      nm = dsc.nm;

      dpper(satrec, inclm, satrec->init, &satrec->ecco, &satrec->inclo,
            &satrec->nodeo, &satrec->argpo, &satrec->mo, satrec->operationmode);

      argpm = 0.0;
      nodem = 0.0;
      mm = 0.0;

      dsinit(satrec, satrec->xke, dsc.cosim, emsq, satrec->argpo, dsc.s1, dsc.s2,
             dsc.s3, dsc.s4, dsc.s5, dsc.sinim, dsc.ss1, dsc.ss2, dsc.ss3,
             dsc.ss4, dsc.ss5, dsc.sz1, dsc.sz3, dsc.sz11, dsc.sz13, dsc.sz21,
             dsc.sz23, dsc.sz31, dsc.sz33, satrec->t, tc, satrec->gsto,
             satrec->mo, satrec->mdot, satrec->no_unkozai, satrec->nodeo,
             satrec->nodedot, xpidot, dsc.z1, dsc.z3, dsc.z11, dsc.z13, dsc.z21,
             dsc.z23, dsc.z31, dsc.z33, satrec->ecco, eccsq, &em, &argpm, &inclm,
             &mm, &nm, &nodem, &dndt);
    }

    if (satrec->isimp != 1) {
      cc1sq = satrec->cc1 * satrec->cc1;
      satrec->d2 = 4.0 * ao * tsi * cc1sq;
      temp = satrec->d2 * tsi * satrec->cc1 / 3.0;
      satrec->d3 = (17.0 * ao + sfour) * temp;
      satrec->d4 =
          0.5 * temp * ao * tsi * (221.0 * ao + 31.0 * sfour) * satrec->cc1;
      satrec->t3cof = satrec->d2 + 2.0 * cc1sq;
      satrec->t4cof =
          0.25 * (3.0 * satrec->d3 +
                  satrec->cc1 * (12.0 * satrec->d2 + 10.0 * cc1sq));
      satrec->t5cof = 0.2 * (3.0 * satrec->d4 + 12.0 * satrec->cc1 * satrec->d3 +
                             6.0 * satrec->d2 * satrec->d2 +
                             15.0 * cc1sq * (2.0 * satrec->d2 + cc1sq));
    }
  }

  sgp4(satrec, 0.0, r, v);

  satrec->init = 'n';

  return satrec->error;
}

/* -------------------------------------------------------------------- sgp4 */

int sgp4(elsetrec *satrec, double tsince, double r[3], double v[3]) {
  double temp4, x2o3, vkmpersec;
  double xmdf, argpdf, nodedf, argpm, mm, t2, nodem, tempa, tempe, templ;
  double delomg, delmtemp, delm, temp, t3, t4;
  double nm, em, inclm, tc, atime, xli, xni, dndt;
  double am, xlm, emsq;
  double sinim, cosim, ep, xincp, argpp, nodep, mp, sinip, cosip;
  double axnl, aynl, xl, u, eo1, tem5, sineo1 = 0.0, coseo1 = 0.0;
  double ecose, esine, el2, pl, rl, rdotl, rvdotl, betal, sinu, cosu, su, sin2u,
      cos2u, temp1, temp2, cosisq, mrt, mvt, rvdot, xnode, xinc;
  double sinsu, cossu, snod, cnod, sini, cosi, xmx, xmy, ux, uy, uz, vx, vy, vz;
  double mr;
  int ktr;

  mrt = 0.0;
  temp4 = 1.5e-12;
  x2o3 = 2.0 / 3.0;
  vkmpersec = satrec->radiusearthkm * satrec->xke / 60.0;

  satrec->t = tsince;
  satrec->error = 0;
  satrec->error_message[0] = '\0';

  xmdf = satrec->mo + satrec->mdot * satrec->t;
  argpdf = satrec->argpo + satrec->argpdot * satrec->t;
  nodedf = satrec->nodeo + satrec->nodedot * satrec->t;
  argpm = argpdf;
  mm = xmdf;
  t2 = satrec->t * satrec->t;
  nodem = nodedf + satrec->nodecf * t2;
  tempa = 1.0 - satrec->cc1 * satrec->t;
  tempe = satrec->bstar * satrec->cc4 * satrec->t;
  templ = satrec->t2cof * t2;

  if (satrec->isimp != 1) {
    delomg = satrec->omgcof * satrec->t;
    delmtemp = 1.0 + satrec->eta * cos(xmdf);
    delm = satrec->xmcof * (delmtemp * delmtemp * delmtemp - satrec->delmo);
    temp = delomg + delm;
    mm = xmdf + temp;
    argpm = argpdf - temp;
    t3 = t2 * satrec->t;
    t4 = t3 * satrec->t;
    tempa = tempa - satrec->d2 * t2 - satrec->d3 * t3 - satrec->d4 * t4;
    tempe = tempe + satrec->bstar * satrec->cc5 * (sin(mm) - satrec->sinmao);
    templ = templ + satrec->t3cof * t3 +
            t4 * (satrec->t4cof + satrec->t * satrec->t5cof);
  }

  nm = satrec->no_unkozai;
  em = satrec->ecco;
  inclm = satrec->inclo;
  if (satrec->method == 'd') {
    tc = satrec->t;
    atime = satrec->atime;
    xli = satrec->xli;
    xni = satrec->xni;
    dspace(satrec, satrec->argpo, satrec->argpdot, satrec->t, tc, satrec->gsto,
           satrec->xfact, satrec->xlamo, satrec->no_unkozai, &atime, &em, &argpm,
           &inclm, &xli, &mm, &xni, &nodem, &dndt, &nm);
  }

  if (nm <= 0.0) {
    snprintf(satrec->error_message, sizeof(satrec->error_message),
             "mean motion %f is less than zero", nm);
    satrec->error = 2;
    r[0] = r[1] = r[2] = NAN;
    v[0] = v[1] = v[2] = NAN;
    return satrec->error;
  }

  am = pow((satrec->xke / nm), x2o3) * tempa * tempa;
  nm = satrec->xke / pow(am, 1.5);
  em = em - tempe;

  if (em >= 1.0 || em < -0.001) {
    snprintf(satrec->error_message, sizeof(satrec->error_message),
             "mean eccentricity %f not within range 0.0 <= e < 1.0", em);
    satrec->error = 1;
    r[0] = r[1] = r[2] = NAN;
    v[0] = v[1] = v[2] = NAN;
    return satrec->error;
  }

  if (em < 1.0e-6) em = 1.0e-6;
  mm = mm + satrec->no_unkozai * templ;
  xlm = mm + argpm + nodem;
  emsq = em * em;
  temp = 1.0 - emsq;

  nodem = fmod(nodem, sgp4_twopi);
  argpm = fmod(argpm, sgp4_twopi);
  xlm = fmod(xlm, sgp4_twopi);
  mm = fmod(xlm - argpm - nodem, sgp4_twopi);

  satrec->am = am;
  satrec->em = em;
  satrec->im = inclm;
  satrec->Om = nodem;
  satrec->om = argpm;
  satrec->mm = mm;
  satrec->nm = nm;

  sinim = sin(inclm);
  cosim = cos(inclm);

  ep = em;
  xincp = inclm;
  argpp = argpm;
  nodep = nodem;
  mp = mm;
  sinip = sinim;
  cosip = cosim;
  if (satrec->method == 'd') {
    dpper(satrec, satrec->inclo, 'n', &ep, &xincp, &nodep, &argpp, &mp,
          satrec->operationmode);
    if (xincp < 0.0) {
      xincp = -xincp;
      nodep = nodep + sgp4_pi;
      argpp = argpp - sgp4_pi;
    }

    if (ep < 0.0 || ep > 1.0) {
      snprintf(satrec->error_message, sizeof(satrec->error_message),
               "perturbed eccentricity %f not within range 0.0 <= e <= 1.0", ep);
      satrec->error = 3;
      r[0] = r[1] = r[2] = NAN;
      v[0] = v[1] = v[2] = NAN;
      return satrec->error;
    }
  }

  if (satrec->method == 'd') {
    sinip = sin(xincp);
    cosip = cos(xincp);
    satrec->aycof = -0.5 * satrec->j3oj2 * sinip;
    if (fabs(cosip + 1.0) > 1.5e-12)
      satrec->xlcof =
          -0.25 * satrec->j3oj2 * sinip * (3.0 + 5.0 * cosip) / (1.0 + cosip);
    else
      satrec->xlcof =
          -0.25 * satrec->j3oj2 * sinip * (3.0 + 5.0 * cosip) / temp4;
  }

  axnl = ep * cos(argpp);
  temp = 1.0 / (am * (1.0 - ep * ep));
  aynl = ep * sin(argpp) + temp * satrec->aycof;
  xl = mp + argpp + nodep + temp * satrec->xlcof * axnl;

  u = fmod(xl - nodep, sgp4_twopi);
  eo1 = u;
  tem5 = 9999.9;
  ktr = 1;
  while (fabs(tem5) >= 1.0e-12 && ktr <= 10) {
    sineo1 = sin(eo1);
    coseo1 = cos(eo1);
    tem5 = 1.0 - coseo1 * axnl - sineo1 * aynl;
    tem5 = (u - aynl * coseo1 + axnl * sineo1 - eo1) / tem5;
    if (fabs(tem5) >= 0.95) tem5 = tem5 > 0.0 ? 0.95 : -0.95;
    eo1 = eo1 + tem5;
    ktr = ktr + 1;
  }

  ecose = axnl * coseo1 + aynl * sineo1;
  esine = axnl * sineo1 - aynl * coseo1;
  el2 = axnl * axnl + aynl * aynl;
  pl = am * (1.0 - el2);
  if (pl < 0.0) {
    snprintf(satrec->error_message, sizeof(satrec->error_message),
             "semilatus rectum %f is less than zero", pl);
    satrec->error = 4;
    r[0] = r[1] = r[2] = NAN;
    v[0] = v[1] = v[2] = NAN;
    return satrec->error;
  }

  rl = am * (1.0 - ecose);
  rdotl = sqrt(am) * esine / rl;
  rvdotl = sqrt(pl) / rl;
  betal = sqrt(1.0 - el2);
  temp = esine / (1.0 + betal);
  sinu = am / rl * (sineo1 - aynl - axnl * temp);
  cosu = am / rl * (coseo1 - axnl + aynl * temp);
  su = atan2(sinu, cosu);
  sin2u = (cosu + cosu) * sinu;
  cos2u = 1.0 - 2.0 * sinu * sinu;
  temp = 1.0 / pl;
  temp1 = 0.5 * satrec->j2 * temp;
  temp2 = temp1 * temp;

  if (satrec->method == 'd') {
    cosisq = cosip * cosip;
    satrec->con41 = 3.0 * cosisq - 1.0;
    satrec->x1mth2 = 1.0 - cosisq;
    satrec->x7thm1 = 7.0 * cosisq - 1.0;
  }

  mrt = rl * (1.0 - 1.5 * temp2 * betal * satrec->con41) +
        0.5 * temp1 * satrec->x1mth2 * cos2u;
  su = su - 0.25 * temp2 * satrec->x7thm1 * sin2u;
  xnode = nodep + 1.5 * temp2 * cosip * sin2u;
  xinc = xincp + 1.5 * temp2 * cosip * sinip * cos2u;
  mvt = rdotl - nm * temp1 * satrec->x1mth2 * sin2u / satrec->xke;
  rvdot = rvdotl +
          nm * temp1 * (satrec->x1mth2 * cos2u + 1.5 * satrec->con41) /
              satrec->xke;

  sinsu = sin(su);
  cossu = cos(su);
  snod = sin(xnode);
  cnod = cos(xnode);
  sini = sin(xinc);
  cosi = cos(xinc);
  xmx = -snod * cosi;
  xmy = cnod * cosi;
  ux = xmx * sinsu + cnod * cossu;
  uy = xmy * sinsu + snod * cossu;
  uz = sini * sinsu;
  vx = xmx * cossu - cnod * sinsu;
  vy = xmy * cossu - snod * sinsu;
  vz = sini * cossu;

  mr = mrt * satrec->radiusearthkm;
  r[0] = mr * ux;
  r[1] = mr * uy;
  r[2] = mr * uz;
  v[0] = (mvt * ux + rvdot * vx) * vkmpersec;
  v[1] = (mvt * uy + rvdot * vy) * vkmpersec;
  v[2] = (mvt * uz + rvdot * vz) * vkmpersec;

  if (mrt < 1.0) {
    snprintf(satrec->error_message, sizeof(satrec->error_message),
             "mrt %f is less than 1.0 indicating the satellite has decayed",
             mrt);
    satrec->error = 6;
  }

  return satrec->error;
}

/* -------------------------------------------------------- date conversions */

void sgp4_days2mdhms(int year, double days, int *mon, int *day, int *hr,
                     int *minute, double *sec) {
  int i, inttemp, dayofyr;
  double temp;
  int lmonth[13] = {0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};

  dayofyr = (int)floor(days);
  if ((year % 4) == 0) lmonth[2] = 29;

  i = 1;
  inttemp = 0;
  while ((dayofyr > inttemp + lmonth[i]) && (i < 12)) {
    inttemp = inttemp + lmonth[i];
    i++;
  }
  *mon = i;
  *day = dayofyr - inttemp;

  temp = (days - dayofyr) * 24.0;
  *hr = (int)floor(temp);
  temp = (temp - *hr) * 60.0;
  *minute = (int)floor(temp);
  *sec = (temp - *minute) * 60.0;
}

double sgp4_jday(int year, int mon, int day, int hr, int minute, double sec) {
  return 367.0 * year -
         floor((7.0 * (year + floor((mon + 9.0) / 12.0))) * 0.25) +
         floor(275.0 * mon / 9.0) + day + 1721013.5 +
         ((sec / 60.0 + minute) / 60.0 + hr) / 24.0;
}

/* ------------------------------------------------------------- twoline2rv */

/** Read `width` characters starting at `start` as a double, blanks as zero. */
static double field(const char *line, int start, int width) {
  char buf[32];
  int i, j = 0;

  if (width >= (int)sizeof(buf)) width = (int)sizeof(buf) - 1;
  for (i = 0; i < width; i++) {
    char c = line[start + i];
    if (c == ' ') continue;
    buf[j++] = c;
  }
  buf[j] = '\0';
  if (j == 0) return 0.0;
  return strtod(buf, NULL);
}

/** Read `width` characters starting at `start` as a long, blanks as zero. */
static long field_long(const char *line, int start, int width) {
  char buf[32];
  int i, j = 0;

  if (width >= (int)sizeof(buf)) width = (int)sizeof(buf) - 1;
  for (i = 0; i < width; i++) {
    char c = line[start + i];
    if (c == ' ') continue;
    buf[j++] = c;
  }
  buf[j] = '\0';
  if (j == 0) return 0;
  return strtol(buf, NULL, 10);
}

int sgp4_twoline2rv(const char *longstr1, const char *longstr2, char typerun,
                    char opsmode, sgp4_gravconst whichconst, double *startmfe,
                    double *stopmfe, double *deltamin, elsetrec *satrec) {
  const double xpdotp = 1440.0 / (2.0 * sgp4_pi);
  char l1[140], l2[140];
  size_t len1, len2;
  int nexp, ibexp, two_digit_year, year, mon, day, hr, minute;
  double sec, epoch;
  char nddot_buf[16], bstar_buf[16];

  len1 = strlen(longstr1);
  len2 = strlen(longstr2);
  while (len1 > 0 && (longstr1[len1 - 1] == '\n' || longstr1[len1 - 1] == '\r' ||
                      longstr1[len1 - 1] == ' '))
    len1--;
  while (len2 > 0 && (longstr2[len2 - 1] == '\n' || longstr2[len2 - 1] == '\r' ||
                      longstr2[len2 - 1] == ' '))
    len2--;
  if (len1 >= sizeof(l1)) len1 = sizeof(l1) - 1;
  if (len2 >= sizeof(l2)) len2 = sizeof(l2) - 1;
  memcpy(l1, longstr1, len1);
  l1[len1] = '\0';
  memcpy(l2, longstr2, len2);
  l2[len2] = '\0';

  satrec->error = 0;
  satrec->error_message[0] = '\0';

  if (!(len1 >= 64 && l1[0] == '1' && l1[1] == ' ' && l1[8] == ' ' &&
        l1[23] == '.' && l1[32] == ' ' && l1[34] == '.' && l1[43] == ' ' &&
        l1[52] == ' ' && l1[61] == ' ' && l1[63] == ' '))
    return -1;

  satrec->satnum = field_long(l1, 2, 5);
  satrec->classification = l1[7] == ' ' ? 'U' : l1[7];
  memcpy(satrec->intldesg, l1 + 9, 8);
  satrec->intldesg[8] = '\0';
  two_digit_year = (int)field_long(l1, 18, 2);
  satrec->epochdays = field(l1, 20, 12);
  satrec->ndot = field(l1, 33, 10);
  nddot_buf[0] = l1[44];
  nddot_buf[1] = '.';
  memcpy(nddot_buf + 2, l1 + 45, 5);
  nddot_buf[7] = '\0';
  satrec->nddot = strtod(nddot_buf, NULL);
  nexp = (int)field_long(l1, 50, 2);
  bstar_buf[0] = l1[53];
  bstar_buf[1] = '.';
  memcpy(bstar_buf + 2, l1 + 54, 5);
  bstar_buf[7] = '\0';
  satrec->bstar = strtod(bstar_buf, NULL);
  ibexp = (int)field_long(l1, 59, 2);
  satrec->ephtype = l1[62] == ' ' ? 0 : l1[62] - '0';
  satrec->elnum = field_long(l1, 64, 4);

  if (!(len2 >= 68 && l2[0] == '2' && l2[1] == ' ' && l2[7] == ' ' &&
        l2[11] == '.' && l2[16] == ' ' && l2[20] == '.' && l2[25] == ' ' &&
        l2[33] == ' ' && l2[37] == '.' && l2[42] == ' ' && l2[46] == '.' &&
        l2[51] == ' '))
    return -1;

  if (satrec->satnum != field_long(l2, 2, 5)) return -1;

  satrec->inclo = field(l2, 8, 8);
  satrec->nodeo = field(l2, 17, 8);
  {
    char ecc_buf[16];
    int i;
    ecc_buf[0] = '0';
    ecc_buf[1] = '.';
    for (i = 0; i < 7; i++) {
      char c = l2[26 + i];
      ecc_buf[2 + i] = (c == ' ') ? '0' : c;
    }
    ecc_buf[9] = '\0';
    satrec->ecco = strtod(ecc_buf, NULL);
  }
  satrec->argpo = field(l2, 34, 8);
  satrec->mo = field(l2, 43, 8);
  satrec->no_kozai = field(l2, 52, 11);
  satrec->revnum = field_long(l2, 63, 5);

  *startmfe = -1440.0;
  *stopmfe = 1440.0;
  *deltamin = 10.0;
  if (typerun == 'v' && len2 > 69) {
    double a = 0.0, b = 0.0, c = 0.0;
    if (sscanf(l2 + 69, "%lf %lf %lf", &a, &b, &c) == 3) {
      *startmfe = a;
      *stopmfe = b;
      *deltamin = c;
    }
  }

  satrec->no_kozai = satrec->no_kozai / xpdotp;
  satrec->nddot = satrec->nddot * pow(10.0, nexp);
  satrec->bstar = satrec->bstar * pow(10.0, ibexp);

  satrec->ndot = satrec->ndot / (xpdotp * 1440.0);
  satrec->nddot = satrec->nddot / (xpdotp * 1440.0 * 1440.0);

  satrec->inclo = satrec->inclo * sgp4_deg2rad;
  satrec->nodeo = satrec->nodeo * sgp4_deg2rad;
  satrec->argpo = satrec->argpo * sgp4_deg2rad;
  satrec->mo = satrec->mo * sgp4_deg2rad;

  if (two_digit_year < 57)
    year = two_digit_year + 2000;
  else
    year = two_digit_year + 1900;

  sgp4_days2mdhms(year, satrec->epochdays, &mon, &day, &hr, &minute, &sec);
  satrec->epochyr = year;
  satrec->jdsatepoch = sgp4_jday(year, mon, day, hr, minute, sec);
  epoch = satrec->jdsatepoch - 2433281.5;

  sgp4init(whichconst, opsmode, satrec->satnum, epoch, satrec->bstar,
           satrec->ndot, satrec->nddot, satrec->ecco, satrec->argpo,
           satrec->inclo, satrec->mo, satrec->no_kozai, satrec->nodeo, satrec);

  return 0;
}
