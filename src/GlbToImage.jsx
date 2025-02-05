import React, { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

const Model = ({ path }) => {
  const { scene } = useGLTF(path, true);
  return <primitive object={scene} scale={1.5} />;
};

// Custom component to capture thumbnail
const ThumbnailRenderer = ({ modelPath, onRendered, setLoading, onError }) => {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    const captureImage = () => {
      try {
        gl.render(scene, camera);
        const canvas = gl.domElement;
  
        // Convert canvas to an image
        const imageSrc = canvas.toDataURL("image/png");
        onRendered(imageSrc);
      } catch (error) {
        onError("Error generating thumbnail.");
      } finally{
        setLoading(false)
      }
    };

    setTimeout(captureImage, 1000); // Ensure model is loaded before capturing
  }, [gl, scene, camera, onRendered]);

  return (
    <Suspense fallback={null}>
      <Model path={modelPath} />
    </Suspense>
  );
};

const Thumbnail = ({ modelPath }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const downloadImage = () => {
    if (!imageSrc) return;
    const link = document.createElement("a");
    link.href = imageSrc;
    link.download = "model-thumbnail.png";
    link.click();
  };

  const handleError = (message) => {
    setError(message);
    setLoading(false);
  };

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {loading &&  <p>Loading Model...</p>}

      {imageSrc && (
                <>
                <img
                  src={imageSrc}
                  alt="3D Model Thumbnail"
                  style={{ width: 300, height: 300 }}
                />
                <button onClick={downloadImage} style={{ marginTop: 10 }}>
                  Download Thumbnail
                </button>
              </>
      )}
      {!error && !imageSrc && (
        <Canvas
          style={{ width: 300, height: 300, visibility: 'hidden' }}
          camera={{ position: [0, 2, 5], fov: 50 }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 2, 2]} />
          <OrbitControls enableZoom={false} autoRotate={false} autoRotateSpeed={1} />
          <ThumbnailRenderer 
            modelPath={modelPath} 
            onRendered={setImageSrc} 
            onError={handleError} 
            setLoading={setLoading}
           />
        </Canvas>
      )}
    </div>
  );
};

export default Thumbnail;
