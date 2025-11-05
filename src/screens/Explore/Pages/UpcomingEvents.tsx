import React from 'react';
import { Box } from '@/src/components/ui/box';
import { PageHeader } from '../components/PageHeader';

export const UpcomingEvents = () => {
    return (
        <Box className="flex-1 bg-neutral-50">
            <PageHeader title="Upcoming Events" />
            <Box className="p-4">
                {/* Content goes here */}
            </Box>
        </Box>
    );
};
