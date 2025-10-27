// 运行这个文件来查看正确的 callback URL
const auth0Config = {
  domain: 'dev-avxq6cfxt1j1ffbc.eu.auth0.com',
  clientId: '3vSlkZYR1OCWq14MXAqEZ4DOPgWRgVIc',
};

// Bundle ID 从 Xcode 项目中获取 - 这是实际使用的
const bundleId = 'org.reactjs.native.example.carevoiceosrnsso';

console.log('\n=== Auth0 实际使用的 Callback URLs ===\n');
console.log('⚠️  Auth0 SDK 默认使用 Bundle Identifier 作为 URL scheme');
console.log(`实际 Bundle ID: ${bundleId}`);

console.log('\n✅ 正确的 Callback URLs:');
console.log(`iOS: ${bundleId}://${auth0Config.domain}/ios/${bundleId}/callback`);
console.log(`Android: ${bundleId}://${auth0Config.domain}/android/${bundleId}/callback`);

console.log('\n📋 复制到 Auth0 Dashboard 的 Allowed Callback URLs:');
console.log(`${bundleId}://${auth0Config.domain}/ios/${bundleId}/callback,${bundleId}://${auth0Config.domain}/android/${bundleId}/callback`);

console.log('\n📋 复制到 Auth0 Dashboard 的 Allowed Logout URLs:');
console.log(`${bundleId}://${auth0Config.domain}/ios/${bundleId}/callback,${bundleId}://${auth0Config.domain}/android/${bundleId}/callback`);

console.log('\n🔧 当前 Info.plist 配置的 URL Scheme: $(PRODUCT_BUNDLE_IDENTIFIER)');
console.log('这会被 Xcode 替换为:', bundleId);
