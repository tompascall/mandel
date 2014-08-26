<p>This is a basic application for studying the <a href="http://en.wikipedia.org/wiki/Mandelbrot_set">Mandelbrot set</a>. As Wikipedia says "The Mandelbrot set is the set of complex numbers 'c' for which the sequence ( c , c² + c , (c²+c)² + c , ((c²+c)²+c)² + c , (((c²+c)²+c)²+c)² + c , ...) does not approach infinity." So this mathematical operation (we add the square of a complex number to the complex number, than we also do the same with the result of this operation) is iterated on a complex number again and again.</p> 

<p>The graphical representation of the set is based on the fact, that a complex number can be visually represented as a pair of numbers (a, b) forming a vector. This pair of numbers can be considered as horizontal and vertical coordinates of the complex plane. The complex plane can be paralleled to the canvas, the coordinates of the vector can be paralleled to the coordinates of a point in the canvas.</p>

<p>You have some <strong>color schemes</strong> to try. These are different kinds of sequences in the <a href="http://en.wikipedia.org/wiki/RGB_color_space">RGB color space</a>. You can see the logic of the scheme by the <strong>Demo schemes</strong> button. This shows that what color belongs to the given iteration (from 1 to max. iteration).</p>

<p>It is quite a paradox, but most of the colored points (more precisely the complex numbers that is represented by the colored points) don't belong to the set. These are the points, that approach infinity, as we apply on them the iteration repeatedly. The color of the point depends on the number of iterations that is necessary to know whether the complex number would approach infinity. If the absolute value of the iterated complex number reaches 2, it means that the iteration would approach infinity. If we reach the maximum iteration but the absolute value doesn't reach 2, we suppose that the point in question belongs to the set, and it has (here) white color.</p>

<p>It is possible to <strong>enlarge</strong> an area of the set by marking out the area with your mouse. Just push left mouse button on the upper-left corner of the area, then draw a line to the bottom-right corner. The enlargeable area is a square.</p>

<p>When you make a lot of enlargement after each other, you can reach a point where the numbers cannot be represented anymore, because they are too small. The range of the studied numbers is from (-2 + 2i) to (2 - 2i) at the beginning, and it is divided into as many parts as the width and height of the canvas. When you enlarge, this range becomes smaller, so the step between the parts. This step can become so small, that cannot be represented in this app. There are solutions e.g. <a href="http://mathjs.org/">math.js</a>, that give tools for representing much smaller numbers. Without these tools javascript can represent the numbers between 5e-324 to 1.7976931348623157e+308. If the picture is being deformed or you can see only weird lines, that means you reached the <strong>limit of representation</strong>.</p>

<p>You can adjust the <strong>size of the canvas</strong> in pixels. Now the shape of the canvas is a square, but maybe later it will be redesigned to be able to have two different sides.</p>

<p>The <strong>maximum iteration</strong> can be set, too. Take care that a too big number may freeze your browser for a long time. I tested up to 20000, and it worked well.</p>

<p>This is not the app that you can extremly enjoy on a mobile phone. However, you can use it on touchscreen devices limitedly. To enlarge an area, swipe the diagonal of the enlarging area.</p>

<p>In my experience it is <strong>the best choice to run the app on Firefox</strong>. Chrome is really slow, the other browsers are about twice faster. IE is suprisingly fast, but it has the drawback that you cannot save the picture by right clicking on it, while Chrome and Firefox works well as regards saving the canvas. Safari is quite fast too, but you cannot save the picture.</p>

<p>You can try the app <a href="http://mandel.tompascall.com/">here</a>.</p>
