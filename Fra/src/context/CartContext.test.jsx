import { describe, it, expect, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import { CartProvider, useCart } from "./CartContext";

const STORAGE_KEY = "cotizacion_cart_v1";

const producto = { id: 1, nombre: "Amoxicilina", precio: 25, imagen: "" };

function TestConsumer({ fn }) {
  const cart = useCart();
  fn(cart);
  return null;
}

function renderCart(fn) {
  render(
    <CartProvider>
      <TestConsumer fn={fn} />
    </CartProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("CartContext — addItem", () => {
  it("agrega un producto nuevo con qty 1", () => {
    let cart;
    renderCart((c) => (cart = c));
    act(() => cart.addItem(producto));
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].qty).toBe(1);
  });

  it("incrementa qty si el producto ya existe", () => {
    let cart;
    renderCart((c) => (cart = c));
    act(() => cart.addItem(producto));
    act(() => cart.addItem(producto));
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].qty).toBe(2);
  });
});

describe("CartContext — removeItem", () => {
  it("elimina el producto del carrito", () => {
    let cart;
    renderCart((c) => (cart = c));
    act(() => cart.addItem(producto));
    act(() => cart.removeItem(producto.id));
    expect(cart.items).toHaveLength(0);
  });
});

describe("CartContext — clear", () => {
  it("vacía el carrito", () => {
    let cart;
    renderCart((c) => (cart = c));
    act(() => cart.addItem(producto));
    act(() => cart.clear());
    expect(cart.items).toHaveLength(0);
    expect(cart.count).toBe(0);
  });
});

describe("CartContext — persistencia", () => {
  it("guarda el estado en localStorage", () => {
    let cart;
    renderCart((c) => (cart = c));
    act(() => cart.addItem(producto));
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(producto.id);
  });
});

describe("CartContext — subtotal", () => {
  it("calcula subtotal correctamente", () => {
    let cart;
    renderCart((c) => (cart = c));
    act(() => cart.addItem(producto));
    act(() => cart.addItem(producto));
    expect(cart.subtotal).toBe(50);
  });
});
