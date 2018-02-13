
// variables globales

var lienzo = document.getElementById("lienzo");
var pluma = lienzo.getContext("2d");
var screen_alto = lienzo.height;
var screen_ancho = lienzo.width;

var tablero = [];
var alto = 20;
var ancho = 40;
var color1 = [5, 230, 90];
var color2 = [200, 10, 20];
var color3 = [200, 5, 180];
var vicolor = [[255, 255, 255], color1, color2, color3];
var colores = [[104, 104, 104], [150, 74, 0], [231, 123, 12], [240, 211, 0], [0, 194, 201]];
var size = 10;
var sizes = [0, 7, 10];

var inertes = [];
var plantas = [[52, 25, 25, 52], [25, 52, 52, 25], [19, 1, 25, 0], [19, 7, 25, 4], [25, 4, 52, 1], [25, 7, 52, 3], [52, 0, 19, 19]];
var bichos = [[53, 18, 103, 7], [53, 25, 103, 3], [53, 52, 103, 7], [103, 1, 53, 53], [53, 0, 0, 53]];
var especies = [inertes, plantas, bichos];
var muerte = [0, 800, 200];
var time = 0;
var pausa = false;

// funciones auxiliares

function invertir(lis, cond){
	if (!cond){
		return lis;
	}
	return [lis[1], lis[0]];
}

function root(num){
	if (num == 0){
		return 0;
	}
	var a = 1;
	var b = num;
	while (b - a > 1){
		c = parseInt((b + a)/2);
		if (c*(c + 1)/2 > num){
			b = c;
		} else {
			a = c;
		}
	}
	return a;
}

function juntar(a, b){
	return (a + b + 1)*(a + b + 2)/2 - a - 1;
}

function sacar(num){
	rr = root(num);
	res = num - rr*(rr + 1)/2;
	return [rr - res, res];
}

function ynt(num){
	if (num > 0){
		return parseInt(num)
	}
	return parseInt(num) - 1
}

function prod(lis, k){
	for (var ii=0; ii<3; ii++){
		lis[ii] = parseInt(lis[ii]*k);
	}
	return lis;
}

function rgbstr(lis){
	return "rgb(" + lis[0] + "," + lis[1] + "," + lis[2] + ")";
}

function square(p, q, d, c){
	pluma.fillStyle = c;
	pluma.fillRect(p - d, q - d, 1, 2*d);
	pluma.fillRect(p - d, q + d, 2*d, 1);
	pluma.fillRect(p - d + 1, q - d, 2*d, 1);
	pluma.fillRect(p + d, q - d + 1, 1, 2*d);
}

function block(p, q, d, c){
	for (var tt=0; tt<4; tt++){
		square(p, q, d - tt, rgbstr(prod([c[0], c[1], c[2]], tt*(32 - 5*tt)/51.0)));
	}
	pluma.fillStyle = rgbstr([c[0], c[1], c[2]]);
	pluma.fillRect(p - d + 4, q - d + 4, 2*d - 7, 2*d - 7);
}

// funciones especificas para los graficos

function colormap(lis){
	if (lis.length > 2){
		return vicolor[lis[2]];
	}
	if (lis[0] == 0){
		return [0, 0, 0];
	}
	aux = lis[1] - lis[0];
	return colores[3 + aux];
}

function draw(){
	pluma.fillStyle = 'black';
	pluma.fillRect(25, 25, screen_ancho, 2*size*(alto + 1));
	for (var ii=0; ii<ancho; ii++){
		for (var jj=0; jj<alto; jj++){
			el = tablero[ii][jj];
			block(50 + 2*size*ii, 50 + 2*size*jj, sizes[el[0]], colormap(el));
		}
	}
}

//

function generar(){
	for (var ii=0; ii<ancho; ii++){
		tablero[ii] = [];
		for (var jj=0; jj<alto; jj++){
			rr = Math.random()*3.0//6.0
			tablero[ii][jj] = [0 + (rr > 1), 0 + (rr > 2)];//[0 + (rr > 1.0) + (rr > 3.0), 0 + (rr > 2.0) - (ynt(rr) == 3) + (rr > 5.0)];
		}
	}
}

function reset(){
	pluma.fillStyle = "black";
	pluma.fillRect(25, 25, screen_ancho, 2*size*(alto + 1));
	ancho = parseInt(document.getElementById('numero2').value);
	alto = parseInt(document.getElementById('numero1').value);
	tablero = [];
	generar();
	//time = 0;
	draw();
}

function calcula(lis){ // no se usa
	aa = tablero[lis[0]][lis[1]];
	bb = tablero[lis[2]][lis[3]];
	if (aa[0]==1 && aa[1]==0 || bb[0]==1 && bb[1]==0){
		return true;
	}
	return false;
}

function match(id1, id2, esp){
	for (var ii=0; ii<especies[esp].length; ii++){
		if (especies[esp][ii][0] == id1 && especies[esp][ii][1] == id2){
			var pro1 = sacar(especies[esp][ii][2]);
			var aux = sacar(pro1[1]);
			pro1 = [pro1[0], aux[0], aux[1]];
			if (aux[1] == 0){
				pro1 = [pro1[0], pro1[1]]
			}
			var pro2 = sacar(especies[esp][ii][3]);
			aux = sacar(pro2[1]);
			pro2 = [pro2[0], aux[0], aux[1]];
			if (aux[1] == 0){
				pro2 = [pro2[0], pro2[1]]
			}
			return [pro1, pro2]
		}
	}
	return false;
}

function procesa(el1, el2){
	k1 = el1;
	k2 = el2;
	if (k2.length > k1.length){
		k1 = el2;
		k2 = el1;
	}
	if (k1.length > 2){
		id1 = juntar(k1[0], juntar(k1[1], k1[2]));
		id2 = juntar(k2[0], juntar(k2[1], 0));
		if (k2.length > 2){
			id2 = juntar(k2[0], juntar(k2[1], k2[2]));
		}
		return match(id1, id2, k1[2]);
	}
	ph1 = el1[1] - el1[0];
	ph2 = el2[1] - el2[0];
	rad1 = el1[1] + el1[0];
	rad2 = el2[1] + el2[0];
	swap = false;
	if (ph1 > ph2){
		swap = true;
		var aux = ph1;
		ph1 = ph2;
		ph2 = aux;
		aux = rad1;
		rad1 = rad2;
		rad2 = aux;
	}
	if (ph1 == -2){
		if (rad2 == 0){
			return invertir([[(rad1 - ph1)/2 - 1, (rad1 + ph1)/2], [1, 0]], swap);
		}
		if (ph2 >= 0){
			return invertir([[(rad1 - ph1)/2, (rad1 + ph1)/2 + 1], [(rad2 - ph2)/2, (rad2 + ph2)/2 - 1]], swap);
		}
	}
	if (ph1 == -1){
		if (rad1 == 1){
			if (rad2 == 0){
				return [el2, el1];
			}
		}
		if (0 == ph2 && rad1 == rad2 - 1){
			return [el2, el1];
		}
		if (ph2 > 0){
			return invertir([[(rad1 - ph1)/2, (rad1 + ph1)/2 + 1], [(rad2 - ph2)/2, (rad2 + ph2)/2 - 1]], swap);
		}
	}
	return false;
}

function mover(){
	var mapa = [];
	for (var ii=0; ii<ancho; ii++){
		mapa[ii] = [];
		for (var jj=0; jj<alto; jj++){
			mapa[ii][jj] = true;
		}
	}
	var moves = [];
	var count = 0;
	for (var tt=0; tt<ancho*alto /2; tt++){
		var xr = parseInt(ancho*Math.random());
		var yr = parseInt(alto*Math.random());
		if (mapa[xr][yr]){
			var rr = parseInt(Math.random()*4);
			var xn = (ancho + xr + (rr==1) - (rr==2))%ancho;
			var yn = (yr + alto + (rr==3) - (rr==0))%alto;
			if (mapa[xn][yn]){
				mapa[xn][yn] = false;
				mapa[xr][yr] = false;
				moves[count] = [xr, yr, xn, yn];
				count++;
			}
		}
	}
	for (var ii=0; ii<count; ii++){
		var p = procesa(tablero[moves[ii][0]][moves[ii][1]], tablero[moves[ii][2]][moves[ii][3]]);
		if (p){
			tablero[moves[ii][0]][moves[ii][1]] = p[0];
			tablero[moves[ii][2]][moves[ii][3]] = p[1];
		}
	}
	for (var ii=0; ii<ancho; ii++){
		for (var jj=0; jj<alto; jj++){
			if (tablero[ii][jj].length > 2){
				var rr = Math.random()*muerte[tablero[ii][jj][2]];
				if (rr < 1.){
					tablero[ii][jj] = [tablero[ii][jj][0], tablero[ii][jj][1]];
				}
			}
		}
	}
}

function contar(){
	res = [0, 0, 0];
	energia = 0;
	materia = 0;
	for (var ii=0; ii<ancho; ii++){
		for (var jj=0; jj<alto; jj++){
			materia = materia + tablero[ii][jj][0];
			energia = energia + tablero[ii][jj][1];
			if (tablero[ii][jj].length > 2){
				res[tablero[ii][jj][2]]++;
			}
		}
	}
	console.log(materia, energia);
	return res;
}

function llave(a, b){
	return b[1] - a[1];
}

function revisar(){
	if (pausa){
		return;
	}
	mover();
	if (time%40 == 0){
		pluma.fillStyle = rgbstr(color1);
		var aux = contar();
		tot = 0;
		for (var ii=0; ii<aux.length; ii++){
			tot = tot + aux[ii];
			aux[ii] = [ii, aux[ii]];
		}
		aux[0] = [0, tot];
		aux.sort(llave);
		for (var ii=0; ii<aux.length; ii++){
			pluma.fillStyle = rgbstr(vicolor[aux[ii][0]]);
			pluma.fillRect(20 + time/40, screen_alto - aux[ii][1], 1, aux[ii][1]);
		}
	}
	draw();
	time++;
}

function crear_vida(){
	var xxx = ynt(ancho/2);
	var yyy = ynt(alto/2);
	tablero[xxx][yyy] = [1, 1, 1];
	tablero[xxx][yyy + 1] = [1, 1, 1];
	tablero[xxx + 1][yyy] = [1, 1, 1];
	tablero[xxx + 1][yyy + 1] = [1, 1, 1];
	tablero[xxx - 1][yyy - 1] = [1, 1, 2];
	tablero[xxx - 1][yyy] = [1, 1, 2];
}

pluma.fillRect(0, 0, screen_ancho, screen_alto);

reset();
crear_vida();
window.setInterval(revisar, 10);