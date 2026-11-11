import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { EmptyState } from '../components/ui/States.jsx';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <Card>
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="This page doesn't exist in the seller panel."
        action={<Button variant="primary" onClick={() => navigate('/')}>Back to overview</Button>}
      />
    </Card>
  );
}
