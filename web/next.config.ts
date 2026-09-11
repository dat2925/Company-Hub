import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl=createNextIntlPlugin('./src/i18n/request.ts');
export default withNextIntl({
  output: process.env.VERCEL ? undefined : 'standalone',
  agentRules: false
});
