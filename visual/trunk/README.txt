===============================================================
                       README for PEAL 2
        The visual programming extension to Jon Bevan's 
  Programming environment for Adaptation Language tool (PEAL)
===============================================================

Licensing:

PEAL 2 is licensed by Jan Bothma and Jon Bevan under a Creative Commons Attribution 2.5 License.
PEAL is licensed by Jon Bevan under a Creative Commons Attribution 2.5 License.
The icons are licensed by Mark James under a Creative Commons Attribution 2.5 License.

CodeMirror is licensed by Marijn Haverbeke under a BSD-style license.

The Yahoo User Interface Library is licensed by Yahoo! Inc. and its components are provided free of charge under a liberal BSD license. 

The Raphaël JavaScript library is released under the MIT License included at the end of this file.


Server Requirements:

 *  Apache (probably. Only tested on Apache anyway)
 *  PHP
 *  Mysql database, 1 table, 1 user
 *  ./users/ must be owned by the user that PHP runs as (often the web 
        server's user) for the PHP chmod function called during installation 
        to work.
 *  php/db_config.php must be writable by the user that PHP runs as (often the 
        web server's user)


Client requirements:

 *  Firefox 3 (Other browsers and versions untested or currently have limited 
        support)
 *  Javascript enabled
 *  Usable on low-end computers e.g. 1400 MHz CPU, 500Mb RAM. Much smoother 
        on systems with more CPU power.


Instructions:

 1. Copy all files to the web server directory e.g. public_html
 2. Visit install.php
 
 
Licenses - full text
 
Software License Agreement (BSD License)
Copyright (c) 2010, Yahoo! Inc.
All rights reserved.

Redistribution and use of this software in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice, this list of conditions and the
      following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
    * Neither the name of Yahoo! Inc. nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission of Yahoo! Inc.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
Sources of Intellectual Property Included in the YUI Library

Where not otherwise indicated, all YUI content is authored by Yahoo! engineers and consists of Yahoo!-owned intellectual property. YUI is issued by Yahoo! under the BSD license above. In some specific instances, YUI will incorporate work done by developers outside of Yahoo! with their express permission.

Below is the explicit list of external (non-Yahoo) sources of intellectual property in YUI, along with the licensing terms that pertain to those sources of IP:

   1. Douglas Crockford's JSON parsing and stringifying methods: In the JSON Utility, Douglas Crockford's JSON parsing and stringifying methods are adapted from work published at JSON.org. The adapted work is in the public domain.
   2. Robert Penner's animation-easing algorithms: In the Animation Utility, YUI makes use of Robert Penner's algorithms for easing.
   3. Geoff Stearns's SWFObject: In the Charts Control and the Uploader, YUI makes use of Geoff Stearns's SWFObject v1.5 for Flash Player detection and embedding. More information on SWFObject can be found here (http://blog.deconcept.com/swfobject/). SWFObject is (c) 2007 Geoff Stearns and is released under the MIT License (http://www.opensource.org/licenses/mit-license.php).
   4. DOMContentLoaded Event Browser Normalization: The techniques employed to simulate this event in browsers that do not support the event natively is based on work by Dean Edwards, John Resig, Matthias Miller, and Diego Perini. 
 
============================================================================== 

The MIT License

Copyright (c) <year> <copyright holders>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.