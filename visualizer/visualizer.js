const circles = document.querySelectorAll('circle');
const innitialPosition = Array.from(circles).map(circle => {
	return { x: circle.cx.baseVal.value, y: circle.cy.baseVal.value };
});

const _fileInputElement = document.querySelector('#music-upload');
const _audioPlayer = document.querySelector('#audio-player');

const RADIUS = 70;
// Circle spin speed
const TURN_OFFSET_INCREMENT = 0.002;
// Modfies the length that point travels from its original position on every frequency change
const BOUNCE_LENGTH_MODIFIER = 0.2;

_fileInputElement.addEventListener('change', () => handleAudioFileChange());
_audioPlayer.addEventListener('play', () => handleAudioFileStart());

let started = false;

let ref;

function handleAudioFileStart() {
	if (!started) {
		anime({
			targets: 'path',
			translateX: -25,
			easing: 'linear'
		});
		anime({
			targets: 'line',
			translateX: -25,
			easing: 'linear'
		});

		circles.forEach((circle, index) => {
			const x = 850 + RADIUS * Math.sin((360 / circles.length) * index);
			const y = 70 + RADIUS * Math.cos((360 / circles.length) * index);

			anime({
				targets: circle,
				translateX: 0,
				trasnlateY: 0,
				cx: x,
				cy: y,
				easing: 'linear'
			});
		});
	}

	setTimeout(() => {
		const _context = new AudioContext();
		const _source = _context.createMediaElementSource(_audioPlayer);
		const _analyser = _context.createAnalyser();
		_source.connect(_analyser);
		_analyser.connect(_context.destination);
		_analyser.fftSize = 256;
		// const _bufferLength = _analyser.frequencyBinCount;
		const _bufferLength = circles.length;

		let dataArray = new Uint8Array(_bufferLength);

		let turnOffset = 0;

		function draw() {
			ref = requestAnimationFrame(draw);
			turnOffset = turnOffset + TURN_OFFSET_INCREMENT;
			_analyser.getByteFrequencyData(dataArray);

			for (var i = 0; i < _bufferLength; i++) {
				const _bounceLength = dataArray[i];
				const x =
					850 +
					(RADIUS + _bounceLength * BOUNCE_LENGTH_MODIFIER) *
						Math.sin((360 / _bufferLength) * i - turnOffset);
				const y =
					70 +
					(RADIUS + _bounceLength * BOUNCE_LENGTH_MODIFIER) *
						Math.cos((360 / _bufferLength) * i - turnOffset);

				circles[i].setAttribute('cx', x);
				circles[i].setAttribute('cy', y);
			}
		}

		_audioPlayer.play();
		draw();
	}, 1000);
	started = true;
}

function handleAudioFileChange() {
	_audioPlayer.src = URL.createObjectURL(_fileInputElement.files[0]);
	_audioPlayer.load();
}

function stop() {
	_audioPlayer.pause();
	cancelAnimationFrame(ref);
	anime({
		targets: 'path',
		translateX: 0,
		easing: 'linear'
	});
	anime({
		targets: 'line',
		translateX: 0,
		easing: 'linear'
	});
	for (let i = 0; i < innitialPosition.length; i++) {
		anime({
			targets: circles[i],
			cx: innitialPosition[i].x,
			cy: innitialPosition[i].y,
			easing: 'linear'
		});
	}
}

const audioControl = document.getElementById('audio-control');

document.addEventListener('keydown', event => {
	if (event.key === 'd') {
		if (audioControl.classList.contains('hidden')) {
			audioControl.classList.remove('hidden');
		} else {
			audioControl.classList.add('hidden');
		}
	}

	if (event.key === 'a') {
		_audioPlayer.pause();
	}

	if (event.key === 's') {
		_audioPlayer.play();
	}

	if (event.key === 'q') {
		stop();
	}
});
