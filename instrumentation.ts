export async function register() {
  if (
    process.env.NEXT_RUNTIME === 'nodejs' &&
    process.env.NEXT_PUBLIC_API_MOCKING === 'enabled'
  ) {
    const { server } = await import('./mocks/server');
    server.listen({
      onUnhandledFrame: 'bypass',
    });
    console.log('🔶 Mock server started in development mode');
  } else {
    console.log('✅ Mock server not started (not in development mode)');
  }
}
