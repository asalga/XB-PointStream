/*
 Copyright (C) 2007 Apple Inc.  All rights reserved.
 Copyright (C) 2010 Mozilla Foundation

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions
 are met:
 1. Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
 2. Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.

 THIS SOFTWARE IS PROVIDED BY APPLE COMPUTER, INC. ``AS IS'' AND ANY
 EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE COMPUTER, INC. OR
 CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
onmessage = function (event) {
    var kernel, kernelSize, kernelSum, pix = event.data, eps = (+pix.eps)*255;
    pix.sig = +pix.sig;
    if(pix.sig){
        buildKernel();
        pix.a = blur(pix.a, pix.height, pix.width);
        pix.b = blur(pix.b, pix.height, pix.width);
    }
    comparePixels(pix);
    postMessage({"id":pix.cId, "data":pix.c});
    function buildKernel() {
        var ss = pix.sig * pix.sig;
        var factor = 2 * Math.PI * ss;
        kernel = [];
        kernel.push([]);
        var i = 0, j;
        do {
            var g = Math.exp(-(i * i) / (2 * ss)) / factor;
            if (g < 1e-3) break;
            kernel[0].push(g);
            ++i;
        } while (i < 7);
        kernelSize = i;
        for (j = 1; j < kernelSize; ++j) {
            kernel.push([]);
            for (i = 0; i < kernelSize; ++i) {
                var g = Math.exp(-(i * i + j * j) / (2 * ss)) / factor;
                kernel[j].push(g);
            }
        }
        kernelSum = 0;
        for (j = 1 - kernelSize; j < kernelSize; ++j) {
            for (i = 1 - kernelSize; i < kernelSize; ++i) {
                kernelSum += kernel[Math.abs(j)][Math.abs(i)];
            }
        }
    }
    function blur(data, height, width) {
        var newData = new Uint8Array(data.length);
        for (var y = 0; y < height; ++y) {
            for (var x = 0; x < width; ++x) {
                var r = 0, g = 0, b = 0, a = 0;
                for (j = 1 - kernelSize; j < kernelSize; ++j) {
                    if (y + j < 0 || y + j >= height) continue;
                    for (i = 1 - kernelSize; i < kernelSize; ++i) {
                        if (x + i < 0 || x + i >= width) continue;
                        r += data[4 * ((y + j) * width + (x + i)) + 0] * kernel[Math.abs(j)][Math.abs(i)];
                        g += data[4 * ((y + j) * width + (x + i)) + 1] * kernel[Math.abs(j)][Math.abs(i)];
                        b += data[4 * ((y + j) * width + (x + i)) + 2] * kernel[Math.abs(j)][Math.abs(i)];
                        a += data[4 * ((y + j) * width + (x + i)) + 3] * kernel[Math.abs(j)][Math.abs(i)];
                    }
                }
                newData[4 * (y * width + x) + 0] = Math.round(r / kernelSum);
                newData[4 * (y * width + x) + 1] = Math.round(g / kernelSum);
                newData[4 * (y * width + x) + 2] = Math.round(b / kernelSum);
                newData[4 * (y * width + x) + 3] = Math.round(a / kernelSum);
            }
        }
        return newData;
    }
    function comparePixels(pix) {
        var failed = false;
        if (pix.a.length === pix.b.length) {
            var j, len = pix.b.length;
            for (j = 0; j < len; j += 4) {
                if (Math.abs(pix.b[j] - pix.a[j]) <= eps &&
                    Math.abs(pix.b[j + 1] - pix.a[j + 1]) <= eps &&
                    Math.abs(pix.b[j + 2] - pix.a[j + 2]) <= eps &&
                    Math.abs(pix.b[j + 3] - pix.a[j + 3]) <= eps) {
                    pix.c[j] = pix.c[j + 1] = pix.c[j + 2] = pix.c[j + 3] = 0;
                }
                else {
                    pix.c[j] = pix.c[j + 3] = 255;
                    pix.c[j + 1] = pix.c[j + 2] = 0;
                    failed = true;
                }
            }
        }
        else {
            failed = true;
        }
        if (!failed) {
            for (j = 0; j < len; j += 4) {
                pix.c[j + 1] = pix.c[j+3] = 255;
            }
        }
    }
};
