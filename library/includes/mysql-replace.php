<?php

/*
 *	Find and Replace for MySQL WP Database
 *
 *	Will find and replace values in mysql. Will work on 
 *	serialized arrays as well.
**/

class MySQL_Replace {
	
	public static $tables = array(
		'wp_options' => array(
			'option_id' => array( 'option_value' )
		),
		'wp_posts' => array(
			'ID' => array( 'guid', 'post_content', 'post_excerpt' )
		),
		'wp_postmeta' => array(
			'meta_id' => array( 'meta_value' )
		)
	);
	
	
	//empty constructor
	function __construct() {
	}
	
	
	//static replace func
	static function replace($needle, $replace) {
		global $wpdb;
		
		if( empty($needle) || empty($replace) )
			return false;
		
		foreach( MySQL_Replace::$tables as $tbl => $fields ) {
			foreach( $fields as $id => $field ) {
				foreach( $field as $col ) {
					
					//run qyery
					$query = $wpdb->get_results("SELECT $id, $col FROM $tbl WHERE $col LIKE '%$needle%'");
					
					if( empty($query) )
						continue;
					
					//parse
					foreach( $query as $row ) {
						$data = @unserialize($row->$col);
						
						if( $data !== false ) {	// is array
							foreach( $data as $k => $v )
								$data[$k] = str_replace( $needle, $replace, $v );
							
							$result = serialize($data);
							
						}else {	// is string
							$result = str_replace( $needle, $replace, $row->$col );
						}
						
						//update db
						$update = $wpdb->update($tbl, array($col => $result), array( $id => $row->$id) );
						
					}// foreach( $query as $row )
						
				}//foreach( $field as $col )
				
			}//foreach( $fields as $id => $field )
		}//foreach( MySQL_Replace::$tables as $tbl => $fields )
		
	}//function
	
}

?>