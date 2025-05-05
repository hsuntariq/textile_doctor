import React, { useState } from "react";
import {
  ViroARScene,
  ViroText,
  ViroARSceneNavigator,
  ViroConstants,
  ViroARPlaneSelector,
  Viro3DObject,
  ViroNode,
  ViroLine,
} from "@viro-community/react-viro";

const ARMeasureScene = () => {
  const [points, setPoints] = useState([]);
  const [distance, setDistance] = useState(0);

  const onPlaneTap = (source) => {
    const newPoint = source.nativeEvent.position;
    const newPoints = [...points, newPoint];
    setPoints(newPoints);

    if (newPoints.length === 2) {
      const [p1, p2] = newPoints;
      const dist = Math.sqrt(
        (p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2 + (p1[2] - p2[2]) ** 2
      );
      setDistance(dist);
    }
  };

  return (
    <ViroARScene onTrackingUpdated={onInitialized} onClick={onPlaneTap}>
      <ViroARPlaneSelector />

      {points.length === 2 && (
        <>
          <ViroLine
            position={points[0]}
            toPosition={points[1]}
            thickness={0.01}
            materials={["lineMaterial"]}
          />
          <ViroText
            text={`${(distance * 100).toFixed(2)} cm`}
            position={[
              (points[0][0] + points[1][0]) / 2,
              (points[0][1] + points[1][1]) / 2 + 0.02,
              (points[0][2] + points[1][2]) / 2,
            ]}
            style={{ fontSize: 16, color: "white" }}
          />
        </>
      )}
    </ViroARScene>
  );
};

export default () => (
  <ViroARSceneNavigator
    initialScene={{ scene: ARMeasureScene }}
    autofocus={true}
    worldAlignment="Gravity"
  />
);
