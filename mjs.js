/* -*- Mode: js2; js2-basic-offset: 4; indent-tabs-mode: nil; tab-width: 40; -*- */
/*
 * Copyright (c) 2010 Mozilla Corporation
 * Copyright (c) 2010 Vladimir Vukicevic
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
const MJS_VERSION=0x000000;const MJS_DO_ASSERT=true;try{WebGLFloatArray;}catch(x){WebGLFloatArray=Float32Array;}
const MJS_FLOAT_ARRAY_TYPE=WebGLFloatArray;if(MJS_DO_ASSERT){function MathUtils_assert(cond,msg){if(!cond)
throw"Assertion failed: "+msg;}}else{function MathUtils_assert(){}}
var V3={};V3._temp1=new MJS_FLOAT_ARRAY_TYPE(3);V3._temp2=new MJS_FLOAT_ARRAY_TYPE(3);V3._temp3=new MJS_FLOAT_ARRAY_TYPE(3);if(MJS_FLOAT_ARRAY_TYPE==Array){V3.x=[1.0,0.0,0.0];V3.y=[0.0,1.0,0.0];V3.z=[0.0,0.0,1.0];V3.$=function V3_$(x,y,z){return[x,y,z];};V3.clone=function V3_clone(a){return[a[0],a[1],a[2]];};}else{V3.x=new MJS_FLOAT_ARRAY_TYPE([1.0,0.0,0.0]);V3.y=new MJS_FLOAT_ARRAY_TYPE([0.0,1.0,0.0]);V3.z=new MJS_FLOAT_ARRAY_TYPE([0.0,0.0,1.0]);V3.$=function V3_$(x,y,z){return new MJS_FLOAT_ARRAY_TYPE([x,y,z]);};V3.clone=function V3_clone(a){return new MJS_FLOAT_ARRAY_TYPE(a);};}
V3.u=V3.x;V3.v=V3.y;V3.add=function V3_add(a,b,r){if(r==undefined)
r=new MJS_FLOAT_ARRAY_TYPE(3);r[0]=a[0]+b[0];r[1]=a[1]+b[1];r[2]=a[2]+b[2];return r;};V3.sub=function V3_sub(a,b,r){if(r==undefined)
r=new MJS_FLOAT_ARRAY_TYPE(3);r[0]=a[0]-b[0];r[1]=a[1]-b[1];r[2]=a[2]-b[2];return r;};V3.neg=function V3_neg(a,r){if(r==undefined)
r=new MJS_FLOAT_ARRAY_TYPE(3);r[0]=-a[0];r[1]=-a[1];r[2]=-a[2];return r;};V3.direction=function V3_direction(a,b,r){if(r==undefined)
r=new MJS_FLOAT_ARRAY_TYPE(3);return V3.normalize(V3.sub(a,b,r),r);};V3.length=function V3_length(a){return Math.sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2]);};V3.lengthSquared=function V3_lengthSquared(a){return a[0]*a[0]+a[1]*a[1]+a[2]*a[2];};V3.normalize=function V3_normalize(a,r){if(r==undefined)
r=new MJS_FLOAT_ARRAY_TYPE(3);var im=1.0/V3.length(a);r[0]=a[0]*im;r[1]=a[1]*im;r[2]=a[2]*im;return r;};V3.scale=function V3_scale(a,k,r){if(r==undefined)
r=new MJS_FLOAT_ARRAY_TYPE(3);r[0]=a[0]*k;r[1]=a[1]*k;r[2]=a[2]*k;return r;}
V3.dot=function V3_dot(a,b){return a[0]*b[0]+
a[1]*b[1]+
a[2]*b[2];};V3.cross=function V3_cross(a,b,r){if(r==undefined)
r=new MJS_FLOAT_ARRAY_TYPE(3);r[0]=a[1]*b[2]-a[2]*b[1];r[1]=a[2]*b[0]-a[0]*b[2];r[2]=a[0]*b[1]-a[1]*b[0];return r;};var M4x4={};M4x4._temp1=new MJS_FLOAT_ARRAY_TYPE(16);M4x4._temp2=new MJS_FLOAT_ARRAY_TYPE(16);if(MJS_FLOAT_ARRAY_TYPE==Array){M4x4.I=[1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0];M4x4.$=function M4x4_$(m00,m01,m02,m03,m04,m05,m06,m07,m08,m09,m10,m11,m12,m13,m14,m15)
{return[m00,m01,m02,m03,m04,m05,m06,m07,m08,m09,m10,m11,m12,m13,m14,m15];};M4x4.clone=function M4x4_clone(m){return new[m[0],m[1],m[2],m[3],m[4],m[5],m[6],m[7],m[8],m[9],m[10],m[11]];};}else{M4x4.I=new MJS_FLOAT_ARRAY_TYPE([1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]);M4x4.$=function M4x4_$(m00,m01,m02,m03,m04,m05,m06,m07,m08,m09,m10,m11,m12,m13,m14,m15)
{return new MJS_FLOAT_ARRAY_TYPE([m00,m01,m02,m03,m04,m05,m06,m07,m08,m09,m10,m11,m12,m13,m14,m15]);};M4x4.clone=function M4x4_clone(m){return new MJS_FLOAT_ARRAY_TYPE(m);};}
M4x4.identity=M4x4.I;M4x4.topLeft3x3=function M4x4_topLeft3x3(m,r){if(r==undefined)
r=new MJS_FLOAT_ARRAY_TYPE(9);r[0]=m[0];r[1]=m[1];r[2]=m[2];r[3]=m[4];r[4]=m[5];r[5]=m[6];r[6]=m[8];r[7]=m[9];r[8]=m[10];return r;};M4x4.inverseOrthonormal=function M4x4_inverseOrthonormal(m,r){if(r==undefined)
r=new MJS_FLOAT_ARRAY_TYPE(16);M4x4.transpose(m,r);var t=[m[12],m[13],m[14]];r[3]=r[7]=r[11]=0;r[12]=-V3.dot([r[0],r[4],r[8]],t);r[13]=-V3.dot([r[1],r[5],r[9]],t);r[14]=-V3.dot([r[2],r[6],r[10]],t);return r;}
M4x4.inverseTo3x3=function M4x4_inverseTo3x3(m,r){if(r==undefined)
r=new MJS_FLOAT_ARRAY_TYPE(9);var a11=m[10]*m[5]-m[6]*m[9],a21=-m[10]*m[1]+m[2]*m[9],a31=m[6]*m[1]-m[2]*m[5],a12=-m[10]*m[4]+m[6]*m[8],a22=m[10]*m[0]-m[2]*m[8],a32=-m[6]*m[0]+m[2]*m[4],a13=m[9]*m[4]-m[5]*m[8],a23=-m[9]*m[0]+m[1]*m[8],a33=m[5]*m[0]-m[1]*m[4];var det=m[0]*(a11)+m[1]*(a12)+m[2]*(a13);if(det==0)
throw"matrix not invertible";var idet=1.0/det;r[0]=idet*a11;r[1]=idet*a21;r[2]=idet*a31;r[3]=idet*a12;r[4]=idet*a22;r[5]=idet*a32;r[6]=idet*a13;r[7]=idet*a23;r[8]=idet*a33;return r;};M4x4.makeFrustum=function M4x4_makeFrustum(left,right,bottom,top,znear,zfar,r){if(r==undefined)
r=new MJS_FLOAT_ARRAY_TYPE(16);var X=2*znear/(right-left);var Y=2*znear/(top-bottom);var A=(right+left)/(right-left);var B=(top+bottom)/(top-bottom);var C=-(zfar+znear)/(zfar-znear);var D=-2*zfar*znear/(zfar-znear);r[0]=2*znear/(right-left);r[1]=0;r[2]=0;r[3]=0;r[4]=0;r[5]=2*znear/(top-bottom);r[6]=0;r[7]=0;r[8]=(right+left)/(right-left);r[9]=(top+bottom)/(top-bottom);r[10]=-(zfar+znear)/(zfar-znear);r[11]=-1;r[12]=0;r[13]=0;r[14]=-2*zfar*znear/(zfar-znear);r[15]=0;return r;};M4x4.makePerspective=function M4x4_makePerspective(fovy,aspect,znear,zfar,r){var ymax=znear*Math.tan(fovy*Math.PI/360.0);var ymin=-ymax;var xmin=ymin*aspect;var xmax=ymax*aspect;return M4x4.makeFrustum(xmin,xmax,ymin,ymax,znear,zfar,r);};M4x4.makeOrtho=function M4x4_makeOrtho(left,right,bottom,top,znear,zfar,r){if(r==undefined)
r=new MJS_FLOAT_ARRAY_TYPE(16);var tX=-(right+left)/(right-left);var tY=-(top+bottom)/(top-bottom);var tZ=-(zfar+znear)/(zfar-znear);var X=2/(right-left);var Y=2/(top-bottom);var Z=-2/(zfar-znear);r[0]=2/(right-left);r[1]=0;r[2]=0;r[3]=0;r[4]=0;r[5]=2/(top-bottom);r[6]=0;r[7]=0;r[8]=0;r[9]=0;r[10]=-2/(zfar-znear);r[11]=0;r[12]=-(right+left)/(right-left);r[13]=-(top+bottom)/(top-bottom);r[14]=-(zfar+znear)/(zfar-znear);r[15]=0;return r;};M4x4.makeOrtho2D=function M4x4_makeOrtho2D(left,right,bottom,top,r){return M4x4.makeOrtho(left,right,bottom,top,-1,1,r);};M4x4.mul=function M4x4_mul(a,b,r){if(r==undefined)
r=new MJS_FLOAT_ARRAY_TYPE(16);r[0]=b[0]*a[0]+
b[0+1]*a[4]+
b[0+2]*a[8]+
b[0+3]*a[12];r[0+1]=b[0]*a[1]+
b[0+1]*a[5]+
b[0+2]*a[9]+
b[0+3]*a[13];r[0+2]=b[0]*a[2]+
b[0+1]*a[6]+
b[0+2]*a[10]+
b[0+3]*a[14];r[0+3]=b[0]*a[3]+
b[0+1]*a[7]+
b[0+2]*a[11]+
b[0+3]*a[15];r[4]=b[4]*a[0]+
b[4+1]*a[4]+
b[4+2]*a[8]+
b[4+3]*a[12];r[4+1]=b[4]*a[1]+
b[4+1]*a[5]+
b[4+2]*a[9]+
b[4+3]*a[13];r[4+2]=b[4]*a[2]+
b[4+1]*a[6]+
b[4+2]*a[10]+
b[4+3]*a[14];r[4+3]=b[4]*a[3]+
b[4+1]*a[7]+
b[4+2]*a[11]+
b[4+3]*a[15];r[8]=b[8]*a[0]+
b[8+1]*a[4]+
b[8+2]*a[8]+
b[8+3]*a[12];r[8+1]=b[8]*a[1]+
b[8+1]*a[5]+
b[8+2]*a[9]+
b[8+3]*a[13];r[8+2]=b[8]*a[2]+
b[8+1]*a[6]+
b[8+2]*a[10]+
b[8+3]*a[14];r[8+3]=b[8]*a[3]+
b[8+1]*a[7]+
b[8+2]*a[11]+
b[8+3]*a[15];r[12]=b[12]*a[0]+
b[12+1]*a[4]+
b[12+2]*a[8]+
b[12+3]*a[12];r[12+1]=b[12]*a[1]+
b[12+1]*a[5]+
b[12+2]*a[9]+
b[12+3]*a[13];r[12+2]=b[12]*a[2]+
b[12+1]*a[6]+
b[12+2]*a[10]+
b[12+3]*a[14];r[12+3]=b[12]*a[3]+
b[12+1]*a[7]+
b[12+2]*a[11]+
b[12+3]*a[15];return r;};M4x4.makeRotate=function M4x4_makeRotate(angle,axis,r){if(r==undefined)
r=new MJS_FLOAT_ARRAY_TYPE(16);axis=V3.normalize(axis,V3._temp1);var x=axis[0],y=axis[1],z=axis[2];var c=Math.cos(angle);var c1=1-c;var s=Math.sin(angle);r[0]=x*x*c1+c;r[1]=y*x*c1+z*s;r[2]=z*x*c1-y*s;r[3]=0;r[4]=x*y*c1-z*s;r[5]=y*y*c1+c;r[6]=y*z*c1+x*s;r[7]=0;r[8]=x*z*c1+y*s;r[9]=y*z*c1-x*s;r[10]=z*z*c1+c;r[11]=0;r[12]=0;r[13]=0;r[14]=0;r[15]=1;return r;};M4x4.rotate=function M4x4_rotate(angle,axis,m,r){M4x4.makeRotate(angle,axis,M4x4._temp1);return M4x4.mul(m,M4x4._temp1,r);};M4x4.makeScale3=function M4x4_makeScale3(x,y,z,r){if(r==undefined)
r=new MJS_FLOAT_ARRAY_TYPE(16);r[0]=x;r[1]=0;r[2]=0;r[3]=0;r[4]=0;r[5]=y;r[6]=0;r[7]=0;r[8]=0;r[9]=0;r[10]=z;r[11]=0;r[12]=0;r[13]=0;r[14]=0;r[15]=1;return r;};M4x4.makeScale1=function M4x4_makeScale1(k,r){return M4x4.makeScale3(k,k,k,r);};M4x4.makeScale=function M4x4_makeScale(v,r){return M4x4.makeScale3(v[0],v[1],v[2],r);};M4x4.scale3=function M4x4_scale3(x,y,z,m,r){M4x4.makeScale3(x,y,z,M4x4._temp1);return M4x4.mul(m,M4x4._temp1,r);};M4x4.scale1=function M4x4_scale1(k,m,r){M4x4.makeScale3(k,k,k,M4x4._temp1);return M4x4.mul(m,M4x4._temp1,r);};M4x4.scale=function M4x4_scale(v,m,r){M4x4.makeScale3(v[0],v[1],v[2],M4x4._temp1);return M4x4.mul(m,M4x4._temp1,r);};M4x4.makeTranslate3=function M4x4_makeTranslate3(x,y,z,r){if(r==undefined)
r=new MJS_FLOAT_ARRAY_TYPE(16);r[0]=1;r[1]=0;r[2]=0;r[3]=0;r[4]=0;r[5]=1;r[6]=0;r[7]=0;r[8]=0;r[9]=0;r[10]=1;r[11]=0;r[12]=x;r[13]=y;r[14]=z;r[15]=1;return r;};M4x4.makeTranslate1=function M4x4_makeTranslate1(k,r){return M4x4.makeTranslate3(k,k,k,r);};M4x4.makeTranslate=function M4x4_makeTranslate(v,r){return M4x4.makeTranslate3(v[0],v[1],v[2],r);};M4x4.translate3=function M4x4_translate3(x,y,z,m,r){M4x4.makeTranslate3(x,y,z,M4x4._temp1);return M4x4.mul(m,M4x4._temp1,r);};M4x4.translate1=function M4x4_translate1(k,m,r){M4x4.makeTranslate3(k,k,k,M4x4._temp1);return M4x4.mul(m,M4x4._temp1,r);};M4x4.translate=function M4x4_translate(v,m,r){M4x4.makeTranslate3(v[0],v[1],v[2],M4x4._temp1);return M4x4.mul(m,M4x4._temp1,r);};M4x4.makeLookAt=function M4x4_makeLookAt(eye,center,up,r){var z=V3.direction(eye,center,V3._temp1);var x=V3.normalize(V3.cross(up,z,V3._temp2),V3._temp2);var y=V3.normalize(V3.cross(z,x,V3._temp3),V3._temp3);var tm1=M4x4._temp1;var tm2=M4x4._temp2;tm1[0]=x[0];tm1[1]=y[0];tm1[2]=z[0];tm1[3]=0;tm1[4]=x[1];tm1[5]=y[1];tm1[6]=z[1];tm1[7]=0;tm1[8]=x[2];tm1[9]=y[2];tm1[10]=z[2];tm1[11]=0;tm1[12]=0;tm1[13]=0;tm1[14]=0;tm1[15]=1;tm2[0]=1;tm2[1]=0;tm2[2]=0;tm2[3]=0;tm2[4]=0;tm2[5]=1;tm2[6]=0;tm2[7]=0;tm2[8]=0;tm2[9]=0;tm2[10]=1;tm2[3]=0;tm2[0]=-eye[0];tm2[1]=-eye[1];tm2[2]=-eye[2];tm2[3]=0;if(r==undefined)
r=new MJS_FLOAT_ARRAY_TYPE(16);return M4x4.mul(tm1,tm2,r);};M4x4.transpose=function M4x4_transpose(m,r){if(m==r){var tmp=0.0;tmp=m[1];m[1]=m[4];m[4]=tmp;tmp=m[2];m[2]=m[8];m[8]=tmp;tmp=m[3];m[3]=m[12];m[12]=tmp;tmp=m[6];m[6]=m[9];m[9]=tmp;tmp=m[7];m[7]=m[13];m[13]=tmp;tmp=m[11];m[11]=m[14];m[14]=tmp;return m;}
if(r==undefined)
r=new MJS_FLOAT_ARRAY_TYPE(16);r[0]=m[0];r[1]=m[4];r[2]=m[8];r[3]=m[12];r[4]=m[1];r[5]=m[5];r[6]=m[9];r[7]=m[13];r[8]=m[2];r[9]=m[6];r[10]=m[10];r[11]=m[14];r[12]=m[3];r[13]=m[7];r[14]=m[11];r[15]=m[15];return r;};
