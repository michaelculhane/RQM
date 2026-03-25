CREATE POLICY "categories_insert_admin" ON categories FOR INSERT WITH CHECK (get_my_role() = 'hr_admin');
CREATE POLICY "categories_update_admin" ON categories FOR UPDATE USING (get_my_role() = 'hr_admin');
CREATE POLICY "categories_delete_admin" ON categories FOR DELETE USING (get_my_role() = 'hr_admin');
