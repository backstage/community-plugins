/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Dialog, DialogContent, DialogTitle } from '@material-ui/core';
import confetti from 'canvas-confetti';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  canvas: {
    margin: '20px',
  },
  button: {
    marginTop: '20px',
  },
  winnerContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(3),
  },
  winnerName: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: theme.spacing(2),
  },
}));

interface Participant {
  id: string;
  name: string;
  displayName?: string;
}

interface WheelProps {
  participants: Participant[];
}

export const Wheel = ({ participants }: WheelProps) => {
  const classes = useStyles();
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupWinner, setPopupWinner] = useState<Participant | null>(null);

  const numSectors = participants.length;

  const colors = useMemo(
    () => [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40',
      '#8AC349',
      '#EA526F',
      '#00CFDD',
      '#FF6B8B',
    ],
    [],
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const determineWinner = (finalRotation: number) => {
    const sliceAngle = 360 / numSectors;
    const normalizedRotation = ((finalRotation % 360) + 360) % 360;
    const winningSector = Math.floor(normalizedRotation / sliceAngle);

    setPopupWinner(participants[winningSector]);
    setShowPopup(true);
  };

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const radius = canvas.width / 2;
    const sliceAngle = (2 * Math.PI) / numSectors;

    // Clear previous drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(-rotation * (Math.PI / 180));

    // Draw sectors
    participants.forEach((participant, i) => {
      const startAngle = i * sliceAngle;
      const endAngle = (i + 1) * sliceAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      const color = colors[i % colors.length];
      ctx.fillStyle = color;
      ctx.fill();

      // Draw text
      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '14px Arial';
      const displayText = participant.displayName || participant.name;
      ctx.fillText(displayText, radius - 20, 0);
      ctx.restore();
    });

    ctx.rotate(rotation * (Math.PI / 180)); // Reset rotation
    ctx.translate(-radius, -radius);

    // Draw the static indicator
    const indicatorLength = 20;
    const indicatorWidth = 10;
    ctx.save();
    ctx.translate(canvas.width, canvas.height / 2);
    ctx.beginPath();
    ctx.moveTo(-indicatorLength, -indicatorWidth / 2);
    ctx.lineTo(0, -indicatorWidth / 2);
    ctx.lineTo(0, indicatorWidth / 2);
    ctx.lineTo(-indicatorLength, indicatorWidth / 2);
    ctx.closePath();
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.restore();
  }, [participants, canvasRef, colors, numSectors, rotation]);

  const startSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    // Set the number of full rotations and calculate final rotation
    const numFullRotations = Math.random() * 5 + 5; // Between 5 and 10 full rotations
    const totalRotation = numFullRotations * 360;
    const finalRotation = (rotation + -totalRotation) % 360;

    const spinDuration = 6000;
    const easing = (t: number) => {
      // Ease-out cubic
      return 1 - Math.pow(1 - t, 3);
    };

    let startTime: number;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const t = Math.min(elapsed / spinDuration, 1);
      const easeT = easing(t);
      const currentRotation = rotation + -totalRotation * easeT;

      setRotation(currentRotation);

      if (elapsed < spinDuration) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        determineWinner(finalRotation);
      }
    };

    requestAnimationFrame(animate);
  };

  const startConfetti = (): void => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  useEffect(() => {
    if (!showPopup) {
      return; // Early return if showPopup is false
    }

    startConfetti();
    const timer = setTimeout(() => setShowPopup(false), 5000);

    clearTimeout(timer);
  }, [showPopup]);

  useEffect(() => {
    if (canvasRef.current) {
      drawWheel();
    }
  }, [drawWheel]);

  return (
    <div className={classes.container}>
      <canvas
        ref={canvasRef}
        width={600} // Increased width
        height={600}
        className={classes.canvas}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={startSpin}
        disabled={isSpinning}
        className={classes.button}
      >
        {isSpinning ? 'Spinning...' : 'Spin!'}
      </Button>
      <Dialog open={showPopup} onClose={() => setShowPopup(false)}>
        <DialogTitle>We have a winner!</DialogTitle>
        <DialogContent className={classes.winnerContent}>
          <div className={classes.winnerName}>
            {popupWinner ? popupWinner.displayName || popupWinner.name : ''}
          </div>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowPopup(false)}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
