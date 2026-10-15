package com.boltpay;

import com.boltpay.dto.CheckoutRequest;
import com.boltpay.dto.CheckoutResponse;
import com.boltpay.models.Checkout;
import com.boltpay.repositories.CheckoutRepository;
import com.boltpay.services.CheckoutService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CheckoutServiceTest {

    @Mock
    private CheckoutRepository checkoutRepository;

    @InjectMocks
    private CheckoutService checkoutService;

    @Test
    @DisplayName("Should successfully submit authenticated checkout")
    void testAuthenticatedCheckout() {
        Checkout savedCheckout = new Checkout(1L, "user@example.com", "555-1234", "123 Main St");
        savedCheckout.setId(42L);

        when(checkoutRepository.save(any(Checkout.class))).thenReturn(savedCheckout);

        CheckoutRequest request = new CheckoutRequest("user@example.com", "555-1234", "123 Main St");
        CheckoutResponse response = checkoutService.submitCheckout(request, 1L);

        assertThat(response.success()).isTrue();
        assertThat(response.checkoutId()).isEqualTo(42L);
        assertThat(response.userId()).isEqualTo(1L);
        assertThat(response.guest()).isFalse();

        verify(checkoutRepository).save(any(Checkout.class));
    }

    @Test
    @DisplayName("Should successfully submit guest checkout with null userId")
    void testGuestCheckout() {
        Checkout savedCheckout = new Checkout(null, "guest@example.com", "555-9876", "456 Market St");
        savedCheckout.setId(99L);

        when(checkoutRepository.save(any(Checkout.class))).thenReturn(savedCheckout);

        CheckoutRequest request = new CheckoutRequest("guest@example.com", "555-9876", "456 Market St");
        CheckoutResponse response = checkoutService.submitCheckout(request, null);

        assertThat(response.success()).isTrue();
        assertThat(response.checkoutId()).isEqualTo(99L);
        assertThat(response.userId()).isNull();
        assertThat(response.guest()).isTrue();

        verify(checkoutRepository).save(any(Checkout.class));
    }
}
