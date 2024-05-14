export function getPolygonBoundingBox(polygon: IPolygon): {
   minX: number;
   minY: number;
   width: number;
   height: number;
} {
   let minX = Infinity;
   let minY = Infinity;
   let maxX = -Infinity;
   let maxY = -Infinity;

   for (const point of polygon.points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
   }

   return {
      minX,
      minY,
      width: maxX - minX,
      height: maxY - minY,
   };
}

export function updatePolygonBounds(
   polygon: IPolygon,
   newSize: { width: number; height: number }
): IPolygon {
   const boundingBox = getPolygonBoundingBox(polygon);

   const scaleX = newSize.width / boundingBox.width;
   const scaleY = newSize.height / boundingBox.height;

   const newPoints = polygon.points.map((point) => {
      // Scale points from the minimum x and y to keep top-left corner at its place
      const newX = boundingBox.minX + (point.x - boundingBox.minX) * scaleX;
      const newY = boundingBox.minY + (point.y - boundingBox.minY) * scaleY;
      return { x: newX, y: newY };
   });

   return {
      ...polygon,
      points: newPoints,
   };
}

export function getPolygonCenter(polygon: IPolygon): Point {
   let centroid = { x: 0, y: 0 };

   if (polygon.points.length === 0) {
      return centroid;
   }

   for (const point of polygon.points) {
      centroid.x += point.x;
      centroid.y += point.y;
   }

   centroid.x /= polygon.points.length;
   centroid.y /= polygon.points.length;

   return centroid;
}
