require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// 請確保您已經設定環境變數
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('請先設定環境變數：')
  console.error('NEXT_PUBLIC_SUPABASE_URL')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDatabase() {
  console.log('🔍 測試資料庫連接和資料表...')
  
  try {
    // 測試連接
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ 連接失敗:', error.message)
      return
    }
    
    console.log('✅ 資料庫連接成功！')
    
    // 檢查資料表是否存在
    const tables = ['users', 'clothing_items', 'outfits', 'travel_outfits']
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ 資料表 ${table} 不存在或無法存取`)
        } else {
          console.log(`✅ 資料表 ${table} 存在且可存取`)
        }
      } catch (err) {
        console.log(`❌ 資料表 ${table} 檢查失敗:`, err.message)
      }
    }
    
    console.log('\n🎉 資料庫測試完成！')
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message)
  }
}

async function testSignUp() {
  const { data, error } = await supabase.auth.signUp({
    email: 'testuser' + Date.now() + '@example.com',
    password: 'test1234'
  })
  console.log('data:', data)
  console.log('error:', error)
}

testDatabase()
testSignUp() 