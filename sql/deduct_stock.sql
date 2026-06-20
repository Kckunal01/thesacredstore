CREATE OR REPLACE FUNCTION public.deduct_stock(
    p_slug text,
    p_quantity integer
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE products
    SET stock = stock - p_quantity
    WHERE slug = p_slug
      AND stock >= p_quantity;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient stock'
        USING ERRCODE = 'P0001';
    END IF;
END;
$$;
