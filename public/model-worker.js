// Web Worker for loading 3D models in background thread
// This prevents blocking the main UI thread during model download

self.addEventListener('message', async (e) => {
  const { type, url } = e.data;
  
  if (type === 'LOAD_MODEL') {
    try {
      console.log('Worker: Starting download of', url);
      
      const response = await fetch(url);
      const totalSize = parseInt(response.headers.get('content-length'), 10);
      
      if (!response.body) {
        throw new Error('ReadableStream not supported');
      }
      
      const reader = response.body.getReader();
      const chunks = [];
      let receivedSize = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        receivedSize += value.length;
        
        // Send progress updates
        const progress = totalSize ? (receivedSize / totalSize) * 100 : 0;
        self.postMessage({
          type: 'PROGRESS',
          progress: Math.round(progress),
          receivedSize,
          totalSize
        });
      }
      
      // Combine all chunks
      const blob = new Blob(chunks);
      const objectUrl = URL.createObjectURL(blob);
      
      self.postMessage({
        type: 'COMPLETE',
        url: objectUrl,
        size: receivedSize
      });
      
    } catch (error) {
      self.postMessage({
        type: 'ERROR',
        error: error.message
      });
    }
  }
});
