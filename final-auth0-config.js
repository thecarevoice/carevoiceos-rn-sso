// 最终的 Auth0 配置验证
const auth0Config = {
  domain: 'dev-avxq6cfxt1j1ffbc.eu.auth0.com',
  clientId: '3vSlkZYR1OCWq14MXAqEZ4DOPgWRgVIc',
};

const bundleId = 'org.reactjs.native.example.carevoiceosrnsso';

console.log('\n🔧 Auth0 Dashboard 最终配置\n');
console.log('=== Allowed Callback URLs ===');
console.log(`${bundleId}://${auth0Config.domain}/ios/${bundleId}/callback,${bundleId}://${auth0Config.domain}/android/${bundleId}/callback`);

console.log('\n=== Allowed Logout URLs ===');
console.log(`${bundleId}://${auth0Config.domain}/ios/${bundleId}/callback,${bundleId}://${auth0Config.domain}/android/${bundleId}/callback`);

console.log('\n=== Allowed Web Origins ===');
console.log('file://*');

console.log('\n✅ 应用将使用的 redirectUrl:');
console.log(`iOS: ${bundleId}://${auth0Config.domain}/ios/${bundleId}/callback`);
console.log(`Android: ${bundleId}://${auth0Config.domain}/android/${bundleId}/callback`);

console.log('\n🚀 配置完成后，保存 Auth0 设置并重新测试登录!');