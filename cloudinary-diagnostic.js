// Script de diagnóstico de Cloudinary
// Abrir la consola del navegador y pegar este código para diagnosticar el problema

console.log('🔍 Diagnóstico de Cloudinary');
console.log('===========================');

// Verificar variables de entorno
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const presetPhotos = import.meta.env.VITE_CLOUDINARY_PRESET_PHOTOS;
const presetMedia = import.meta.env.VITE_CLOUDINARY_PRESET_MEDIA;

console.log('📋 Variables de entorno:');
console.log('  Cloud Name:', cloudName || '❌ NO CONFIGURADO');
console.log('  Preset Photos:', presetPhotos || '❌ NO CONFIGURADO');
console.log('  Preset Media:', presetMedia || '❌ NO CONFIGURADO');

// Verificar información del dispositivo
const isMobile = window.innerWidth < 768;
const userAgent = navigator.userAgent;
console.log('\n📱 Información del dispositivo:');
console.log('  Es móvil:', isMobile ? '✅ Sí' : '❌ No');
console.log('  Ancho de pantalla:', window.innerWidth + 'px');
console.log('  User Agent:', userAgent);

// Verificar conectividad a Cloudinary
if (cloudName && presetPhotos) {
  console.log('\n🌐 Verificando conectividad...');
  
  // Probar con una imagen de prueba (1px transparente)
  const testImageBlob = new Blob([
    new Uint8Array([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1,
      0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 10, 73, 68, 65, 84,
      120, 218, 99, 0, 1, 0, 0, 5, 0, 1, 13, 10, 45, 219, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130
    ])
  ], { type: 'image/png' });

  const formData = new FormData();
  formData.append('file', testImageBlob, 'test.png');
  formData.append('upload_preset', presetPhotos);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  console.log('  URL de upload:', uploadUrl);
  
  fetch(uploadUrl, {
    method: 'POST',
    body: formData
  })
  .then(response => {
    console.log('  Status:', response.status);
    console.log('  Headers:', Object.fromEntries(response.headers));
    return response.text();
  })
  .then(text => {
    try {
      const data = JSON.parse(text);
      console.log('  Respuesta exitosa:', data);
      console.log('✅ Cloudinary funciona correctamente!');
    } catch (e) {
      console.log('  Respuesta (texto):', text);
      console.log('❌ Error en la respuesta de Cloudinary');
    }
  })
  .catch(error => {
    console.log('❌ Error de red:', error);
  });
} else {
  console.log('\n❌ No se puede verificar conectividad sin configuración completa');
}

console.log('\n🔧 Posibles soluciones:');
console.log('1. Verificar que el .env tenga todas las variables configuradas');
console.log('2. Verificar que los presets existan en Cloudinary Dashboard');
console.log('3. Verificar CORS settings en Cloudinary (Settings > Upload)');
console.log('4. Verificar que los presets sean "unsigned" (no requieran firma)');
console.log('5. Probar en modo incógnito para descartar problemas de caché');