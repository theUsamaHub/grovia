import { Screen } from '@/components/ui/screen';
import { Card, AppText } from '@/components/ui/primitives';
export default function Page() {
  return (
    <Screen title="Your world" subtitle="Room to grow">
      <Card>
        <AppText>
          Your forest will grow here as we build the rewards module.
        </AppText>
      </Card>
    </Screen>
  );
}
