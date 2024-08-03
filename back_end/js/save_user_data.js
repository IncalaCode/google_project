
class Sdb {
    constructor() {
        this.supabase = supabase.createClient(process.env.db_url, process.env.db_pass
        );
    }

    async handleRequest(data, type) {
        switch (type) {
            case 'insert':
                return await this.supabase
                    .from('user') // Replace 'users' with your table name
                    .insert([data]);
            case 'select':
                return await this.supabase
                    .from('user') // Replace 'users' with your table name
                    .select('id,username,data')
                    .eq('username', data.username);
            case 'exists':
                return await this.supabase
                    .from('user') // Replace 'users' with your table name
                    .select('id,username,data')
                    .eq('username', data.username)
                    .eq('password', data.password)
                    .single();
            case 'update':
                return await this.supabase
                    .from('user') // Replace 'users' with your table name
                    .update({ data: data.data })
                    .or(`username.eq.${data},id.eq.${data.id}`)
            default:
                throw new Error('Unsupported request type');
        }
    }
}

export const db = new Sdb();


export async function import_user(user_data, type) {
    try {
        const response = await db.handleRequest(user_data, type);
        return response; // Return the response data for further use
    } catch (error) {
        console.error('Error:', error);
        notyf.error('An error occurred while processing the request');
        throw error; // Ensure errors are propagated
    }
}
