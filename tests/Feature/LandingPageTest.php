<?php

test('landing page loads successfully', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertInertia(
        fn ($page) => $page
            ->component('LandingPage/Index')
    );
});

test('landing page displays menu items prop', function () {
    $response = $this->get('/');

    $response->assertInertia(
        fn ($page) => $page
            ->has('menuItems')
    );
});
