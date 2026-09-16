'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseCameraOptions {
  initialFacingMode?: 'environment' | 'user';
  idealWidth?: number;
  idealHeight?: number;
}

export interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  isLoading: boolean;
  error: string | null;
  facingMode: 'environment' | 'user';
  isTorchOn: boolean;
  hasTorch: boolean;
  toggleFacingMode: () => void;
  toggleTorch: () => Promise<void>;
  capturePhoto: () => string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  loadPhotoFromFile: (file: File) => Promise<string>;
}

export function useCamera({
  initialFacingMode = 'environment',
  idealWidth = 1920,
  idealHeight = 1080,
}: UseCameraOptions = {}): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>(initialFacingMode);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    stopCamera();

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Akses kamera tidak didukung pada browser ini atau membutuhkan koneksi aman (HTTPS).');
      setIsLoading(false);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: idealWidth },
          height: { ideal: idealHeight },
        },
        audio: false,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }

      // Check if torch is supported
      const track = newStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.() as any;
      setHasTorch(Boolean(capabilities?.torch));
      setIsTorchOn(false);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Camera access error:', err);
      let message = 'Gagal mengakses kamera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Izin kamera ditolak. Mohon aktifkan izin kamera di pengaturan browser.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'Kamera tidak ditemukan pada perangkat ini.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'Kamera sedang digunakan oleh aplikasi lain.';
      }
      setError(message);
      setIsLoading(false);
    }
  }, [facingMode, idealWidth, idealHeight, stopCamera]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const toggleFacingMode = useCallback(() => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  }, []);

  const toggleTorch = useCallback(async () => {
    if (!stream || !hasTorch) return;
    const track = stream.getVideoTracks()[0];
    try {
      const nextState = !isTorchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextState }],
      });
      setIsTorchOn(nextState);
    } catch (err) {
      console.warn('Torch toggle failed:', err);
    }
  }, [stream, hasTorch, isTorchOn]);

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current) return null;
    const video = videoRef.current;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Flip horizontally if front camera (mirror mode)
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.92);
  }, [facingMode]);

  const loadPhotoFromFile = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Gagal membaca file gambar.'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }, []);

  return {
    videoRef,
    stream,
    isLoading,
    error,
    facingMode,
    isTorchOn,
    hasTorch,
    toggleFacingMode,
    toggleTorch,
    capturePhoto,
    startCamera,
    stopCamera,
    loadPhotoFromFile,
  };
}
