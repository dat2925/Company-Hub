import { ChatPage } from '@/features/chat/chat-page';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'chat' });
  return {
    title: t('title'),
  };
}

export default function Page() {
  return <ChatPage />;
}
