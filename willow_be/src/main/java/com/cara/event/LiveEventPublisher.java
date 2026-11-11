package com.cara.event;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/** Thin facade so services publish dashboard events without knowing about SSE. */
@Component
public class LiveEventPublisher {

    private final ApplicationEventPublisher publisher;

    public LiveEventPublisher(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    public void publish(String type, Object payload) {
        publisher.publishEvent(LiveEvent.of(type, payload));
    }
}
