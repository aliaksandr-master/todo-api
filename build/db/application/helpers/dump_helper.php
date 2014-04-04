<?php

function dump ($var, $showFullData = false, $escapeTags = false, $cover = true) {
    if($cover){
        print '<div class="_dump_">';
        print '<span class="_dump_close_" title="Hide this DUMP" onclick="_dump_close_click(this);">&times;</span>';
        print('<span class="_dump_pin_" title="Pin this DUMP" onclick="_dump_pin_click(this);">&copy;</span>'."\n");
    }
    if($escapeTags){
        ob_start();
        if($showFullData){
            var_dump($var);
        } else {
            print_r($var);
        }
        $str = ob_get_contents();
        ob_end_clean();
        $str = str_replace("&","&amp;", $str);
        $str = str_replace("<","&lt;", $str);
        $str = str_replace(">","&gt;", $str);
        print $str;
    }else{
        if($showFullData){
            var_dump($var);
        }else{
            print_r($var);
        }
    }
    if($cover){
        print "\n</div>";
        if(!defined("DUMP_STYLE_EXISTS")){
            define("DUMP_STYLE_EXISTS",1);
            print '
<style type="text/css">
    ._dump_ { display: block !important; text-align: left !important; position: relative !important; border-radius: 3px !important; overflow: hidden !important; background: #c8d1d8 !important; white-space: pre !important; border:1px solid #aaa !important; margin: 5px !important; padding: 10px !important; font-family: "Courier New",monospace !important; font-weight: normal !important; font-size: 11px !important; line-height: 14px !important; color: #222 !important; z-index: 9999 !important; }
    ._dump_._dump__pin { z-index: 9999 !important; position: fixed !important; top: 0 !important; bottom: 0 !important; left: 0 !important; right: 0 !important; overflow: auto !important; }
    ._dump_pin_,
    ._dump_close_ { display: block !important; position: absolute !important; top: 0 !important; right: 0 !important; font-size: 16px !important; line-height: 12px !important; height: 12px !important; cursor: pointer !important; }
    ._dump_._dump__closed { display: none !important; }
    ._dump_pin_ { left: 5px !important; right: auto !important; font-size: 12px !important; }
    ._dump_close_:hover,
    ._dump_pin_:hover { color: red !important; }
</style>
';
            print
                '
                <script type="text/javascript">
                    function _dump_close_click(that){
                        var p=that.parentNode;
                        p.className=p.className+" _dump__closed";
                    }

                    function _dump_pin_click(that){
                        var p=that.parentNode;
                        if(/_dump__pin/.test(p.className)){
                            p.className=p.className.replace("_dump__pin","");
                        }else{
                            p.className=p.className+" _dump__pin";
                        }
                    }
                </script>
                ';
        }
    }
}