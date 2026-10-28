import { Screen } from '@/components/ui/screen';
import { Card, AppText } from '@/components/ui/primitives';
export default function Page() {
  return (
    <Screen title="Insights" subtitle="Room to grow">
      <Card>
        <AppText>
          Your focus patterns will take shape here. Sessions are already being
          saved locally.
        </AppText>
      </Card>
    </Screen>
  );
}
